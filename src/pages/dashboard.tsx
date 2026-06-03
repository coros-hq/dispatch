import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { PlusIcon, LogOutIcon, UserIcon, ZapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignsTab } from "@/components/dashboard/CampaignsTab";

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { setTemplate, setCurrentProjectId } = useEditorStore();
  const {
    activeTeamId,
    activeRole,
    teams,
    setTeams,
    setActiveRole,
  } = useTeamStore();
  useSyncTeamRole();
  const [projects, setProjects] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"updated" | "created" | "name">("updated");
  const [memberCount, setMemberCount] = useState<number | undefined>();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { plan } = usePlanStore();
  const limits = PLAN_LIMITS[plan];
  const atProjectLimit =
    !activeTeamId && projects.length >= limits.maxProjects;

  const activeTeam = teams.find((t) => t.id === activeTeamId);
  const canEdit = !activeTeamId || canEditTeam(activeRole);

  const sortedProjects = useMemo(() => {
    const list = [...projects];
    if (sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "created") {
      list.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    } else {
      list.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
    }
    return list;
  }, [projects, sort]);

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
            (t) =>
              !t.is_default &&
              t.user_id === user?.id &&
              !t.team_id,
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
      toast.success("Gmail connected successfully");
      setSearchParams({}, { replace: true });
    } else if (connected === "outlook") {
      toast.success("Outlook connected successfully");
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

  const workspaceTitle = activeTeam ? activeTeam.name : "My projects";
  const workspaceSubtitle = activeTeam
    ? `Team workspace · ${projects.length} project${projects.length !== 1 ? "s" : ""}`
    : `${projects.length} project${projects.length !== 1 ? "s" : ""}`;

  return (
    <div className="min-h-screen bg-muted">
      <header className="h-14 border-b border-white/20 flex items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <img src={Logo} alt="MailShot" className="w-7 h-7" />
          <span className="text-base font-semibold text-foreground">
            MailShot
          </span>
          <Separator
            className="text-white bg-white/20"
            orientation="vertical"
          />
          <WorkspaceSwitcher
            memberCount={memberCount}
            onWorkspaceChange={(teamId) => {
              loadTeams();
              loadProjects(search, teamId);
            }}
          />
          <Separator
            className="text-white bg-white/20"
            orientation="vertical"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/profile")}
            className="text-muted-foreground hover:text-foreground"
          >
            <UserIcon className="w-4 h-4 mr-2" />
            Profile
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {plan === "pro" ? (
            <span className="text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
              PRO
            </span>
          ) : (
            <Button
              size="sm"
              className="h-7 text-xs bg-amber-500 hover:bg-amber-600 text-black"
              onClick={() => setUpgradeOpen(true)}
            >
              <ZapIcon className="w-3 h-3 mr-1" />
              Upgrade
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            Sign out
            <LogOutIcon className="ml-1" />
          </Button>
        </div>
      </header>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl mb-8 text-white font-semibold">
          👋 Hello {user?.user_metadata?.first_name}{" "}
          {user?.user_metadata?.last_name} !
        </h1>

        <Tabs defaultValue="projects">
          <TabsList className="mb-8">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {workspaceTitle}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {workspaceSubtitle}
            </p>
            {!canEdit && activeTeam && (
              <p className="text-xs text-amber-500/90 mt-1">
                View-only access — you can preview projects but not edit or save
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 mb-6">
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-full text-white"
            />
            <Select
              value={sort}
              onValueChange={(v) => setSort(v as typeof sort)}
            >
              <SelectTrigger className="w-56 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Last updated</SelectItem>
                <SelectItem value="created">Date created</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-row items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/templates")}
              className="text-muted-foreground hover:text-foreground"
            >
              Templates
            </Button>
            {canEdit && (
              <Button onClick={handleNew}>
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
          />
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-xl border border-border bg-card animate-pulse"
              />
            ))}
          </div>
        ) : sortedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <img src={Logo} alt="MailShot" className="w-7 h-7 opacity-40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                No projects yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {canEdit
                  ? "Create your first newsletter to get started"
                  : "No team projects to show"}
              </p>
            </div>
            {canEdit && (
              <Button onClick={handleNew}>
                <PlusIcon className="w-4 h-4 mr-2" />
                New project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleOpen(project)}
                onDelete={
                  canEdit ? () => handleDelete(project.id) : undefined
                }
                canRename={canEdit}
              />
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
  );
}
