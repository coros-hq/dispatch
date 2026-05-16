export type TeamRole = "owner" | "editor" | "viewer";

export type Team = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  invited_by: string | null;
  joined_at: string;
  profile?: {
    first_name: string;
    last_name: string;
    email?: string;
  };
};

export type TeamInvitation = {
  id: string;
  team_id: string;
  email: string;
  role: TeamRole;
  token: string;
  invited_by: string | null;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
  team?: Team;
};
