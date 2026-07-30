import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  PlusIcon,
  LogOutIcon,
  UserIcon,
  ZapIcon,
  FolderIcon,
  SendIcon,
  LayoutTemplateIcon,
  UsersIcon,
  SearchIcon,
  ChevronsUpDownIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fetchTemplates,
  deleteTemplate,
  migrateTemplate,
} from "@/lib/template-service";
import type { SavedTemplate } from "@/lib/template-service";
import { useAuthStore } from "@/store/auth";
import { useEditorStore } from "@/store/editor";
import { canEditTeam, useTeamStore } from "@/store/team";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";
import Logo from "@/assets/logo.svg";
import type { Template } from "@/types";
import { GOOGLE_FONT_PRESETS } from "@/lib/google-fonts";
import { ProjectCard } from "@/components/ProjectCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkspaceSwitcher } from "@/components/team/WorkspaceSwitcher";
import {
  fetchTeamMembers,
  fetchTeamTemplates,
  fetchUserTeams,
  getMyTeamRole,
} from "@/lib/teamService";
import { useSyncTeamRole } from "@/hooks/useSyncTeamRole";
import { PLAN_LIMITS } from "@/lib/planLimits";
import { usePlanStore } from "@/store/plan";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { CampaignsTab } from "@/components/dashboard/CampaignsTab";
import type { LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DashboardSection = "projects" | "campaigns";

function SidebarNavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full rounded-lg px-2.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar ${
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
      }`}
    >
      <Icon
        className={`w-4 h-4 shrink-0 ${active ? "text-clay" : ""}`}
        strokeWidth={1.75}
      />
      {label}
    </button>
  );
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function NewProjectCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-dashed border-border hover:border-clay/50 hover:bg-accent/40 transition-colors flex flex-col items-center justify-center gap-2 min-h-[200px] text-muted-foreground hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <LayoutTemplateIcon className="w-5 h-5" strokeWidth={1.75} />
      <span className="text-sm font-medium">Start from a template</span>
    </button>
  );
}

function ProjectCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      <Skeleton className="h-[110px] w-full rounded-none" />
      <div className="px-3.5 py-3 border-t border-border flex flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

function EmptyState({
  headline,
  body,
  canEdit,
  onNew,
}: {
  headline: string;
  body: string;
  canEdit: boolean;
  onNew: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 border border-dashed border-border rounded-xl mt-2">
      <div className="text-center max-w-sm">
        <p className="text-lg font-medium text-foreground">{headline}</p>
        <p className="text-sm text-muted-foreground mt-1.5">{body}</p>
      </div>
      {canEdit && (
        <Button
          onClick={onNew}
          className="bg-clay hover:bg-clay/90 text-clay-foreground"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          New project
        </Button>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { setTemplate, setCurrentProjectId } = useEditorStore();
  const { activeTeamId, activeRole, teams, setTeams, setActiveRole } =
    useTeamStore();
  useSyncTeamRole();
  const [projects, setProjects] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [memberCount, setMemberCount] = useState<number | undefined>();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [section, setSection] = useState<DashboardSection>("projects");
  const { plan } = usePlanStore();
  const limits = PLAN_LIMITS[plan];
  const atProjectLimit = !activeTeamId && projects.length >= limits.maxProjects;

  const activeTeam = teams.find((t) => t.id === activeTeamId);
  const canEdit = !activeTeamId || canEditTeam(activeRole);

  const sortedProjects = useMemo(() => {
    return [...projects].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
  }, [projects]);

  const loadTeams = useCallback(async () => {
    try {
      const userTeams = await fetchUserTeams();
      setTeams(userTeams);
      if (activeTeamId && !userTeams.some((t) => t.id === activeTeamId)) {
        useTeamStore.getState().setActiveTeamId(null);
        useTeamStore.getState().setActiveRole(null);
      } else if (activeTeamId) {
        const role = await getMyTeamRole(activeTeamId);
        setActiveRole(role);
        const members = await fetchTeamMembers(activeTeamId);
        setMemberCount(members.length);
      } else {
        setMemberCount(undefined);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load teams");
    }
  }, [activeTeamId, setTeams, setActiveRole]);

  const loadProjects = useCallback(
    async (searchTerm: string, workspaceTeamId?: string | null) => {
      const teamId =
        workspaceTeamId !== undefined
          ? workspaceTeamId
          : useTeamStore.getState().activeTeamId;

      setLoading(true);
      setProjects([]);

      try {
        let templates: SavedTemplate[];
        if (teamId) {
          const raw = await fetchTeamTemplates(teamId);
          templates = (raw as SavedTemplate[]).map((t) => ({
            ...t,
            data: migrateTemplate(t.data),
          }));
        } else {
          const all = await fetchTemplates(searchTerm);
          templates = all.filter(
            (t) => !t.is_default && t.user_id === user?.id && !t.team_id,
          );
        }

        const searchTrim = searchTerm.trim().toLowerCase();
        if (searchTrim) {
          templates = templates.filter((t) =>
            t.name.toLowerCase().includes(searchTrim),
          );
        }
        setProjects(templates);
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load projects",
        );
        setProjects([]);
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected === "gmail") {
      toast.success("Gmail connected");
      setSearchParams({}, { replace: true });
    } else if (connected === "outlook") {
      toast.success("Outlook connected");
      setSearchParams({}, { replace: true });
    } else if (error) {
      toast.error(`Connection failed: ${error}`);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  useEffect(() => {
    loadProjects("", activeTeamId);
  }, [loadProjects, activeTeamId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProjects(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, loadProjects]);

  const handleNew = () => {
    if (!canEdit) {
      toast.error("You don't have permission to create projects in this team");
      return;
    }
    if (atProjectLimit) {
      setUpgradeOpen(true);
      return;
    }
    const pageId = crypto.randomUUID();
    const canvasId = crypto.randomUUID();
    const inter = GOOGLE_FONT_PRESETS.find((p) => p.id === "inter")!;
    setTemplate({
      id: crypto.randomUUID(),
      name: "Untitled",
      pages: [
        {
          id: pageId,
          name: "Page 1",
          canvases: [
            {
              id: canvasId,
              name: "Variant 1",
              x: 0,
              y: 0,
              sections: [],
              globalStyles: {
                fontFamily: inter.fontFamily,
                googleFontCssImportUrl: inter.importUrl,
                bgColor: "#f4f4f4",
                contentWidth: 600,
              },
            },
          ],
          activeCanvasId: canvasId,
        },
      ],
      activePageId: pageId,
    });
    setCurrentProjectId(null);
    navigate("/editor");
  };

  const handleOpen = (project: SavedTemplate) => {
    setTemplate(project.data as Template);
    setCurrentProjectId(project.id);
    navigate(`/editor/${project.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) {
      toast.error("You don't have permission to delete projects");
      return;
    }
    try {
      await deleteTemplate(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in");
  };

  const projectCount = projects.length;
  const projectNoun = `project${projectCount !== 1 ? "s" : ""}`;
  const projectsSubtext = activeTeam
    ? `${activeTeam.name} · ${projectCount} ${projectNoun}`
    : plan === "free"
      ? `${projectCount} of ${limits.maxProjects} on the free plan`
      : `${projectCount} ${projectNoun}`;

  const firstName = user?.user_metadata?.first_name as string | undefined;
  const lastName = user?.user_metadata?.last_name as string | undefined;
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Your account";

  const showTrailingTemplateCard =
    !loading && !search.trim() && canEdit && sortedProjects.length > 0;

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-[200px] shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col h-screen sticky top-0">
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-sidebar-border shrink-0">
          <img src={Logo} alt="" className="w-6 h-6 rounded-md shrink-0" />
          <span className="text-sm font-medium tracking-tight text-sidebar-foreground truncate">
            MailShot
          </span>
        </div>

        <div className="px-4 pt-3 pb-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest truncate">
            {activeTeam ? activeTeam.name : "Personal workspace"}
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
          <WorkspaceSwitcher
            memberCount={memberCount}
            onWorkspaceChange={(teamId) => {
              loadTeams();
              loadProjects(search, teamId);
            }}
          />

          <div className="h-px bg-sidebar-border my-3" />

          <SidebarNavItem
            icon={FolderIcon}
            label="Projects"
            active={section === "projects"}
            onClick={() => setSection("projects")}
          />
          <SidebarNavItem
            icon={SendIcon}
            label="Campaigns"
            active={section === "campaigns"}
            onClick={() => setSection("campaigns")}
          />
          <SidebarNavItem
            icon={LayoutTemplateIcon}
            label="Templates"
            onClick={() => navigate("/templates")}
          />
          {activeTeam && (
            <SidebarNavItem
              icon={UsersIcon}
              label="Team"
              onClick={() => navigate(`/teams/${activeTeam.slug}/settings`)}
            />
          )}
        </nav>

        <div className="p-3 border-t border-sidebar-border shrink-0 flex flex-col gap-2">
          {plan === "pro" ? (
            <span className="text-[10px] font-medium tracking-wide bg-clay/10 text-clay border border-clay/25 px-2 py-0.5 rounded-full w-fit ml-1">
              PRO
            </span>
          ) : (
            <Button
              size="sm"
              className="justify-start bg-clay hover:bg-clay/90 text-clay-foreground"
              onClick={() => setUpgradeOpen(true)}
            >
              <ZapIcon className="w-3.5 h-3.5 mr-1.5" />
              Upgrade to Pro
            </Button>
          )}

          <div className="h-px bg-sidebar-border" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 w-full rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-sidebar-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
              >
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="bg-clay/15 text-clay text-[11px] font-medium">
                    {initialsFor(displayName)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-sidebar-foreground truncate">
                    {displayName}
                  </span>
                  <span className="block text-xs text-muted-foreground truncate">
                    {plan === "pro" ? "Pro plan" : "Free plan"}
                  </span>
                </span>
                <ChevronsUpDownIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <UserIcon className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOutIcon className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <UpgradeModal
          open={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
        />

        <main className="max-w-6xl mx-auto px-6 py-10">
          <Tabs value={section} onValueChange={(v) => setSection(v as DashboardSection)}>
            <TabsContent value="projects">
              <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-xl font-medium text-foreground">
                    Projects
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {projectsSubtext}
                  </p>
                  {!canEdit && activeTeam && (
                    <p className="text-xs text-clay/90 mt-1">
                      View-only access — you can preview projects but not edit
                      or save
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="Search projects"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-56 pl-8 text-foreground"
                    />
                  </div>
                  {canEdit && (
                    <Button
                      onClick={handleNew}
                      className="bg-clay hover:bg-clay/90 text-clay-foreground"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      New project
                    </Button>
                  )}
                </div>
              </div>

              {atProjectLimit && !activeTeamId && (
                <UpgradePrompt
                  feature="Unlimited projects"
                  description={`Free plan includes ${limits.maxProjects} projects. Upgrade to Pro for unlimited.`}
                  compact
                />
              )}

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {[...Array(6)].map((_, i) => (
                    <ProjectCardSkeleton key={i} />
                  ))}
                </div>
              ) : sortedProjects.length === 0 ? (
                search.trim() ? (
                  <EmptyState
                    headline="No projects match this search"
                    body={`Nothing matches "${search.trim()}". Try a different name.`}
                    canEdit={canEdit}
                    onNew={handleNew}
                  />
                ) : (
                  <EmptyState
                    headline="Start your first project"
                    body="Build a newsletter from a blank canvas or a template."
                    canEdit={canEdit}
                    onNew={handleNew}
                  />
                )
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {sortedProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClick={() => handleOpen(project)}
                      onDelete={
                        canEdit ? () => handleDelete(project.id) : undefined
                      }
                      onDuplicated={(copy) =>
                        setProjects((prev) => [copy, ...prev])
                      }
                      canRename={canEdit}
                    />
                  ))}
                  {showTrailingTemplateCard &&
                    (atProjectLimit ? (
                      <div className="rounded-xl border border-border bg-card flex flex-col items-center justify-center gap-3 min-h-[200px] p-6 text-center">
                        <ZapIcon className="w-5 h-5 text-clay" strokeWidth={1.75} />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            You've reached the free plan limit
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Upgrade to Pro for unlimited projects.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-clay hover:bg-clay/90 text-clay-foreground"
                          onClick={() => setUpgradeOpen(true)}
                        >
                          Upgrade to Pro
                        </Button>
                      </div>
                    ) : (
                      <NewProjectCard onClick={() => navigate("/templates")} />
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="campaigns">
              <CampaignsTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
