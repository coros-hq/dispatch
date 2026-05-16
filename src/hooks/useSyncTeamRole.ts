import { useCallback, useEffect } from "react";
import { getMyTeamRole } from "@/lib/teamService";
import { useTeamStore } from "@/store/team";
import type { TeamRole } from "@/types/team";

/** Keeps activeRole in sync with the database (e.g. after an owner changes roles). */
export function useSyncTeamRole(): TeamRole | null {
  const activeTeamId = useTeamStore((s) => s.activeTeamId);
  const activeRole = useTeamStore((s) => s.activeRole);
  const setActiveRole = useTeamStore((s) => s.setActiveRole);

  const sync = useCallback(async () => {
    if (!activeTeamId) {
      setActiveRole(null);
      return;
    }
    try {
      const role = await getMyTeamRole(activeTeamId);
      setActiveRole(role);
    } catch {
      setActiveRole(null);
    }
  }, [activeTeamId, setActiveRole]);

  useEffect(() => {
    void sync();
  }, [sync]);

  useEffect(() => {
    const onFocus = () => void sync();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void sync();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [sync]);

  return activeRole;
}
