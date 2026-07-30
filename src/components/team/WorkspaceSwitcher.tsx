import { useState } from "react";
import { CheckIcon, PlusIcon, SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { useTeamStore } from "@/store/team";
import { getMyTeamRole } from "@/lib/teamService";
import { roleLabel } from "@/lib/team-utils";
import type { Team } from "@/types/team";
import { CreateTeamDialog } from "./CreateTeamDialog";
import { PLAN_LIMITS } from "@/lib/planLimits";
import { usePlanStore } from "@/store/plan";
import { UpgradeModal } from "@/components/ui/UpgradeModal";

type Props = {
  memberCount?: number;
  onWorkspaceChange?: (teamId: string | null) => void;
};

function rowClass(active: boolean) {
  return `flex items-center gap-2 w-full rounded-lg px-2.5 py-2 text-sm transition-colors ${
    active
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
  }`;
}

export function WorkspaceSwitcher({ memberCount, onWorkspaceChange }: Props) {
  const navigate = useNavigate();
  const { activeTeamId, activeRole, teams, setActiveTeamId, setActiveRole } =
    useTeamStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { plan } = usePlanStore();
  const canUseTeams = PLAN_LIMITS[plan].canUseTeams;

  const activeTeam = teams.find((t) => t.id === activeTeamId);

  const selectPersonal = () => {
    setActiveTeamId(null);
    setActiveRole(null);
    onWorkspaceChange?.(null);
  };

  const selectTeam = async (team: Team) => {
    if (!canUseTeams) {
      setUpgradeOpen(true);
      return;
    }
    setActiveTeamId(team.id);
    try {
      const role = await getMyTeamRole(team.id);
      setActiveRole(role);
    } catch {
      setActiveRole(null);
    }
    onWorkspaceChange?.(team.id);
  };

  const handleCreateTeam = () => {
    if (!canUseTeams) {
      setUpgradeOpen(true);
      return;
    }
    setCreateOpen(true);
  };

  return (
    <div className="flex flex-col gap-0.5">
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="Team workspaces"
      />

      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest px-2.5 mb-1">
        Workspace
      </p>

      <button type="button" onClick={selectPersonal} className={rowClass(!activeTeamId)}>
        <span className="flex-1 truncate text-left">Personal</span>
        {!activeTeamId && <CheckIcon className="w-3.5 h-3.5 shrink-0" />}
      </button>

      {teams.map((team) => (
        <button
          key={team.id}
          type="button"
          onClick={() => selectTeam(team)}
          className={rowClass(activeTeamId === team.id)}
        >
          <span className="flex-1 truncate text-left">{team.name}</span>
          {activeTeamId === team.id && (
            <CheckIcon className="w-3.5 h-3.5 shrink-0" />
          )}
        </button>
      ))}

      {activeTeam && (memberCount != null || activeRole) && (
        <div className="flex items-center gap-2 px-2.5 py-1 text-xs text-muted-foreground">
          {memberCount != null && (
            <span>
              {memberCount} member{memberCount !== 1 ? "s" : ""}
            </span>
          )}
          {activeRole && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {roleLabel(activeRole)}
            </Badge>
          )}
        </div>
      )}

      <button type="button" onClick={handleCreateTeam} className={rowClass(false)}>
        <PlusIcon className="w-3.5 h-3.5 shrink-0" />
        Create team
      </button>

      {activeTeam && (
        <button
          type="button"
          onClick={() => navigate(`/teams/${activeTeam.slug}/settings`)}
          className={rowClass(false)}
        >
          <SettingsIcon className="w-3.5 h-3.5 shrink-0" />
          Team settings
        </button>
      )}

      <CreateTeamDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(team) => onWorkspaceChange?.(team.id)}
      />
    </div>
  );
}
