import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  acceptInvitation,
  fetchInvitationByToken,
  fetchUserTeams,
  getMyTeamRole,
} from "@/lib/teamService";
import { roleLabel } from "@/lib/team-utils";
import { useAuthStore } from "@/store/auth";
import { useTeamStore } from "@/store/team";
import type { TeamInvitation } from "@/types/team";
import Logo from "@/assets/logo.svg";
import Loader from "@/components/loader";

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading, verified } = useAuthStore();
  const [invitation, setInvitation] = useState<TeamInvitation | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchInvitationByToken(token)
      .then(setInvitation)
      .catch(() => toast.error("Could not load invitation"))
      .finally(() => setLoadingInvite(false));
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    if (!user) {
      navigate(`/sign-up?redirect=${encodeURIComponent(`/invite/${token}`)}`);
      return;
    }
    setAccepting(true);
    try {
      const invite = invitation ?? (await fetchInvitationByToken(token));
      await acceptInvitation(token);
      if (invite?.team_id) {
        const { setActiveTeamId, setActiveRole, setTeams } =
          useTeamStore.getState();
        setActiveTeamId(invite.team_id);
        const [teams, role] = await Promise.all([
          fetchUserTeams(),
          getMyTeamRole(invite.team_id),
        ]);
        setTeams(teams);
        setActiveRole(role);
      }
      toast.success("You've joined the team");
      navigate("/dashboard");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to accept invitation",
      );
    } finally {
      setAccepting(false);
    }
  };

  if (loadingInvite || !verified || loading) {
    return <Loader />;
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Invitation not found</CardTitle>
            <CardDescription>
              This link may be invalid or expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/")}>
              Go home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const teamName = invitation.team?.name ?? "a team";
  const expired = new Date(invitation.expires_at) < new Date();
  const accepted = !!invitation.accepted_at;

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={Logo} alt="Dispatch" className="w-10 h-10" />
          </div>
          <CardTitle>Join {teamName}</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join as a{" "}
            <strong>{roleLabel(invitation.role)}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {accepted ? (
            <p className="text-sm text-center text-muted-foreground">
              This invitation has already been accepted.
            </p>
          ) : expired ? (
            <p className="text-sm text-center text-destructive">
              This invitation has expired.
            </p>
          ) : (
            <>
              {!user && (
                <p className="text-sm text-center text-muted-foreground">
                  Sign in or create an account to accept this invitation.
                </p>
              )}
              <Button
                className="w-full"
                onClick={handleAccept}
                disabled={accepting}
              >
                {accepting
                  ? "Accepting..."
                  : user
                    ? "Accept invitation"
                    : "Sign up to accept"}
              </Button>
              {!user && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    navigate(
                      `/sign-in?redirect=${encodeURIComponent(`/invite/${token}`)}`,
                    )
                  }
                >
                  Already have an account? Sign in
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
