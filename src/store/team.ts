import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Team, TeamRole } from "../types/team";

type TeamStore = {
  activeTeamId: string | null;
  activeRole: TeamRole | null;
  teams: Team[];
  setActiveTeamId: (id: string | null) => void;
  setActiveRole: (role: TeamRole | null) => void;
  setTeams: (teams: Team[]) => void;
};

export const useTeamStore = create<TeamStore>()(
  persist(
    (set) => ({
      activeTeamId: null,
      activeRole: null,
      teams: [],
      setActiveTeamId: (id) => set({ activeTeamId: id }),
      setActiveRole: (role) => set({ activeRole: role }),
      setTeams: (teams) => set({ teams }),
    }),
    { name: "dispatch-team" },
  ),
);

export function canEditTeam(role: TeamRole | null): boolean {
  return role === "owner" || role === "editor";
}

export function canManageTeam(role: TeamRole | null): boolean {
  return role === "owner";
}
