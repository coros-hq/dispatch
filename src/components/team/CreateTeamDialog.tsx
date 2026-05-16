import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createTeam } from "@/lib/teamService";
import { useTeamStore } from "@/store/team";
import type { Team } from "@/types/team";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (team: Team) => void;
};

export function CreateTeamDialog({ open, onOpenChange, onCreated }: Props) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const { teams, setTeams, setActiveTeamId, setActiveRole } = useTeamStore();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Team name is required");
      return;
    }
    setCreating(true);
    try {
      const team = await createTeam(name.trim());
      const nextTeams = [...teams, team];
      setTeams(nextTeams);
      setActiveTeamId(team.id);
      setActiveRole("owner");
      toast.success(`Team "${team.name}" created`);
      setName("");
      onOpenChange(false);
      onCreated?.(team);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create team workspace</DialogTitle>
          <DialogDescription>
            Collaborate on newsletter projects with your team.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="team-name">Team name</Label>
            <Input
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Marketing"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating || !name.trim()}>
              <PlusIcon className="w-4 h-4 mr-2" />
              {creating ? "Creating..." : "Create team"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
