import { supabase } from "./supabase";
import type { Team, TeamMember, TeamInvitation, TeamRole } from "../types/team";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createTeam(name: string): Promise<Team> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const slug = `${generateSlug(name)}-${Math.random().toString(36).slice(2, 6)}`;

  const { data: team, error } = await supabase
    .from("teams")
    .insert({ name, slug, owner_id: user.id })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("team_members").insert({
    team_id: team.id,
    user_id: user.id,
    role: "owner",
  });

  return team as Team;
}

export async function fetchUserTeams(): Promise<Team[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("team_members")
    .select("team:teams(*)")
    .eq("user_id", user.id);

  if (error) throw error;
  return (
    (data ?? [])
      .map((row) => row.team as Team | Team[] | null)
      .flatMap((team) => (team && !Array.isArray(team) ? [team] : []))
  );
}

export async function fetchTeamBySlug(slug: string): Promise<Team | null> {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Team;
}

type TeamMemberRow = Omit<TeamMember, "profile">;

type MemberProfileRow = Pick<
  NonNullable<TeamMember["profile"]>,
  "first_name" | "last_name"
> & { id: string };

export async function fetchTeamMembers(teamId: string): Promise<TeamMember[]> {
  const { data: members, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", teamId);

  if (error) throw error;
  if (!members?.length) return [];

  const rows = members as TeamMemberRow[];
  const userIds = rows.map((m) => m.user_id);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .in("id", userIds);

  const profileById = new Map(
    ((profiles ?? []) as MemberProfileRow[]).map((p) => [p.id, p]),
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return rows.map((m): TeamMember => {
    const profile = profileById.get(m.user_id);

    return {
      ...m,
      profile: {
        first_name: profile?.first_name ?? "",
        last_name: profile?.last_name ?? "",
        email: m.user_id === user?.id ? (user.email ?? "") : undefined,
      },
    };
  });
}

export async function getMyTeamRole(
  teamId: string,
): Promise<TeamRole | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single();

  if (error) return null;
  return data.role as TeamRole;
}

export async function fetchPendingInvitations(
  teamId: string,
): Promise<TeamInvitation[]> {
  const { data, error } = await supabase
    .from("team_invitations")
    .select("*")
    .eq("team_id", teamId)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as TeamInvitation[];
}

export async function inviteMember(
  teamId: string,
  email: string,
  role: TeamRole,
): Promise<TeamInvitation> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("team_invitations")
    .insert({ team_id: teamId, email, role, invited_by: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as TeamInvitation;
}

export async function sendInviteEmail(params: {
  to: string;
  teamName: string;
  inviterName: string;
  role: TeamRole;
  inviteUrl: string;
}): Promise<void> {
  const res = await fetch("/api/invite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? data.error ?? "Failed to send invite email");
  }
}

export async function fetchInvitationByToken(
  token: string,
): Promise<TeamInvitation | null> {
  const { data, error } = await supabase
    .from("team_invitations")
    .select("*, team:teams(*)")
    .eq("token", token)
    .single();

  if (error) return null;
  return data as TeamInvitation;
}

export async function acceptInvitation(token: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const invitation = await fetchInvitationByToken(token);
  if (!invitation) throw new Error("Invitation not found");
  if (invitation.accepted_at) throw new Error("Invitation already accepted");
  if (new Date(invitation.expires_at) < new Date())
    throw new Error("Invitation expired");

  const { error: memberError } = await supabase.from("team_members").insert({
    team_id: invitation.team_id,
    user_id: user.id,
    role: invitation.role,
    invited_by: invitation.invited_by,
  });

  if (memberError) throw memberError;

  const { error: updateError } = await supabase
    .from("team_invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("token", token);

  if (updateError) throw updateError;
}

export async function updateMemberRole(
  teamId: string,
  userId: string,
  role: TeamRole,
): Promise<void> {
  const { error } = await supabase
    .from("team_members")
    .update({ role })
    .eq("team_id", teamId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function removeMember(
  teamId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function updateTeam(
  teamId: string,
  changes: Partial<Pick<Team, "name">>,
): Promise<void> {
  const { error } = await supabase
    .from("teams")
    .update({ ...changes, updated_at: new Date().toISOString() })
    .eq("id", teamId);

  if (error) throw error;
}

export async function deleteTeam(teamId: string): Promise<void> {
  const { error } = await supabase.from("teams").delete().eq("id", teamId);
  if (error) throw error;
}

export async function fetchTeamTemplates(teamId: string) {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("team_id", teamId)
    .eq("is_default", false)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).filter((row) => row.team_id === teamId);
}
