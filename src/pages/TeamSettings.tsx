import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeftIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import {
  deleteTeam,
  fetchPendingInvitations,
  fetchTeamBySlug,
  fetchTeamMembers,
  getMyTeamRole,
  inviteMember,
  removeMember,
  sendInviteEmail,
  updateMemberRole,
  updateTeam,
} from "@/lib/teamService";
import {
  memberDisplayName,
  memberInitials,
  roleLabel,
} from "@/lib/team-utils";
import { useAuthStore } from "@/store/auth";
import { canManageTeam, useTeamStore } from "@/store/team";
import type { Team, TeamInvitation, TeamMember, TeamRole } from "@/types/team";
import Loader from "@/components/loader";
import Logo from "@/assets/logo.svg";

export default function TeamSettings() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setTeams, teams, setActiveTeamId, setActiveRole } = useTeamStore();

  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [myRole, setMyRole] = useState<TeamRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("editor");
  const [inviting, setInviting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loadedSlug, setLoadedSlug] = useState(slug);

  if (slug !== loadedSlug) {
    setLoadedSlug(slug);
    setTeam(null);
    setMembers([]);
    setInvitations([]);
    setMyRole(null);
    setLoading(true);
  }

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    void (async () => {
      try {
        const t = await fetchTeamBySlug(slug);
        if (cancelled) return;
        if (!t) {
          toast.error("Team not found");
          navigate("/dashboard");
          return;
        }
        setTeam(t);
        setTeamName(t.name);
        const [m, inv, role] = await Promise.all([
          fetchTeamMembers(t.id),
          fetchPendingInvitations(t.id),
          getMyTeamRole(t.id),
        ]);
        if (cancelled) return;
        setMembers(m);
        setInvitations(inv);
        setMyRole(role);
      } catch (err: unknown) {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load team",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  const handleSaveName = async () => {
    if (!team || !teamName.trim()) return;
    setSavingName(true);
    try {
      await updateTeam(team.id, { name: teamName.trim() });
      setTeam({ ...team, name: teamName.trim() });
      setTeams(
        teams.map((t) =>
          t.id === team.id ? { ...t, name: teamName.trim() } : t,
        ),
      );
      toast.success("Team name updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update team");
    } finally {
      setSavingName(false);
    }
  };

  const handleInvite = async () => {
    if (!team || !inviteEmail.trim()) return;
    if (!canManageTeam(myRole)) {
      toast.error("Only owners can invite members");
      return;
    }
    setInviting(true);
    try {
      const invitation = await inviteMember(
        team.id,
        inviteEmail.trim().toLowerCase(),
        inviteRole,
      );
      const inviterName =
        [user?.user_metadata?.first_name, user?.user_metadata?.last_name]
          .filter(Boolean)
          .join(" ") || user?.email || "A teammate";
      const inviteUrl = `${window.location.origin}/invite/${invitation.token}`;
      await sendInviteEmail({
        to: inviteEmail.trim(),
        teamName: team.name,
        inviterName,
        role: inviteRole,
        inviteUrl,
      });
      setInvitations((prev) => [invitation, ...prev]);
      setInviteEmail("");
      toast.success("Invitation sent");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId: string, role: TeamRole) => {
    if (!team) return;
    try {
      await updateMemberRole(team.id, userId, role);
      setMembers((prev) =>
        prev.map((m) => (m.user_id === userId ? { ...m, role } : m)),
      );
      toast.success("Role updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!team) return;
    try {
      await removeMember(team.id, userId);
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
      toast.success("Member removed");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    }
  };

  const handleDeleteTeam = async () => {
    if (!team) return;
    try {
      await deleteTeam(team.id);
      setTeams(teams.filter((t) => t.id !== team.id));
      if (useTeamStore.getState().activeTeamId === team.id) {
        setActiveTeamId(null);
        setActiveRole(null);
      }
      toast.success("Team deleted");
      navigate("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete team");
    }
  };

  if (loading) return <Loader />;
  if (!team) return null;

  const isOwner = canManageTeam(myRole);

  return (
    <div className="min-h-screen bg-muted">
      <header className="h-14 border-b border-white/20 flex items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <img src={Logo} alt="MailShot" className="w-7 h-7" />
          <span className="text-base font-semibold text-foreground">
            MailShot
          </span>
          <Separator className="bg-white/20" orientation="vertical" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="text-white"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{team.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">Team settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team name</CardTitle>
            <CardDescription>Displayed in the workspace switcher</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              disabled={!isOwner}
            />
            {isOwner && (
              <Button onClick={handleSaveName} disabled={savingName}>
                {savingName ? "Saving..." : "Save"}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              {members.length} member{members.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.map((member) => {
              const name = memberDisplayName(
                member.profile?.first_name,
                member.profile?.last_name,
                member.profile?.email,
              );
              const initials = memberInitials(
                member.profile?.first_name,
                member.profile?.last_name,
                member.profile?.email,
              );
              const isSelf = member.user_id === user?.id;

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <Avatar className="size-9">
                    <AvatarImage src={undefined} alt={name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {name}
                      {isSelf && (
                        <span className="text-muted-foreground ml-1">(you)</span>
                      )}
                    </p>
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      {roleLabel(member.role)}
                    </Badge>
                  </div>
                  {isOwner && !isSelf && member.role !== "owner" && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={member.role}
                        onValueChange={(v) =>
                          handleRoleChange(member.user_id, v as TeamRole)
                        }
                      >
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleRemoveMember(member.user_id)}
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle>Invite member</CardTitle>
              <CardDescription>
                Send an email invitation to join this team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Role</Label>
                <Select
                  value={inviteRole}
                  onValueChange={(v) => setInviteRole(v as TeamRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
              >
                {inviting ? "Sending..." : "Send invitation"}
              </Button>
            </CardContent>
          </Card>
        )}

        {isOwner && invitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending invitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                >
                  <span>{inv.email}</span>
                  <Badge variant="secondary">{roleLabel(inv.role)}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {isOwner && (
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">Danger zone</CardTitle>
              <CardDescription>
                Permanently delete this team and all team projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConfirmationDialog
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                title="Delete team?"
                description={`This will permanently delete "${team.name}" and cannot be undone.`}
                trigger={
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2Icon className="w-4 h-4 mr-2" />
                    Delete team
                  </Button>
                }
                actionText="Delete team"
                onAction={handleDeleteTeam}
              />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
