import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon, PlusIcon, SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTeamStore } from "@/store/team";
import { getMyTeamRole } from "@/lib/teamService";
import { roleLabel } from "@/lib/team-utils";
import type { Team } from "@/types/team";
import { CreateTeamDialog } from "./CreateTeamDialog";

type Props = {
  memberCount?: number;
  onWorkspaceChange?: (teamId: string | null) => void;
};

export function WorkspaceSwitcher({ memberCount, onWorkspaceChange }: Props) {
  const navigate = useNavigate();
  const {
    activeTeamId,
    activeRole,
    teams,
    setActiveTeamId,
    setActiveRole,
  } = useTeamStore();
  const [createOpen, setCreateOpen] = useState(false);

  const activeTeam = teams.find((t) => t.id === activeTeamId);
  const workspaceLabel = activeTeam ? activeTeam.name : "Personal";

  const selectPersonal = () => {
    setActiveTeamId(null);
    setActiveRole(null);
    onWorkspaceChange?.(null);
  };

  const selectTeam = async (team: Team) => {
    setActiveTeamId(team.id);
    try {
      const role = await getMyTeamRole(team.id);
      setActiveRole(role);
    } catch {
      setActiveRole(null);
    }
    onWorkspaceChange?.(team.id);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 min-w-[140px] justify-between text-white border-white/20 hover:text-white hover:bg-white/10"
          >
            <span className="truncate max-w-[120px]">{workspaceLabel}</span>
            <ChevronsUpDownIcon className="w-3.5 h-3.5 opacity-70 shrink-0 text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Workspace</DropdownMenuLabel>
          <DropdownMenuItem onClick={selectPersonal}>
            <span className="flex-1">Personal</span>
            {!activeTeamId && <CheckIcon className="w-4 h-4" />}
          </DropdownMenuItem>
          {teams.length > 0 && <DropdownMenuSeparator />}
          {teams.map((team) => (
            <DropdownMenuItem key={team.id} onClick={() => selectTeam(team)}>
              <span className="flex-1 truncate">{team.name}</span>
              {activeTeamId === team.id && <CheckIcon className="w-4 h-4" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreateOpen(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Create team
          </DropdownMenuItem>
          {activeTeam && (
            <DropdownMenuItem
              onClick={() => navigate(`/teams/${activeTeam.slug}/settings`)}
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              Team settings
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {activeTeam && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
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

      <CreateTeamDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(team) => onWorkspaceChange?.(team.id)}
      />
    </>
  );
}
