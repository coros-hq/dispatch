import { useCallback, useEffect, useState } from "react";
import { MailIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import {
  disconnectAccount,
  fetchConnectedAccounts,
  getOAuthConnectUrl,
  type ConnectedAccount,
} from "@/lib/connectedAccountsService";
import SmtpConfigForm from "./SmtpConfigForm";

function ProviderIcon({
  provider,
}: {
  provider: ConnectedAccount["provider"];
}) {
  if (provider === "gmail") {
    return (
      <svg className="size-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#EA4335"
          d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-7.545-4.91v9.273H.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.548l8.073-6.055C21.69 2.278 24 3.434 24 5.457z"
        />
      </svg>
    );
  }
  return (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#0078D4"
        d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"
      />
    </svg>
  );
}

export function SendingSettings() {
  const { user } = useAuthStore();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnectId, setDisconnectId] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchConnectedAccounts();
      setAccounts(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load accounts",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleConnect = (provider: "gmail" | "outlook") => {
    if (!user?.id) return;
    window.location.href = getOAuthConnectUrl(provider, user.id);
  };

  const handleDisconnect = async () => {
    if (!disconnectId) return;
    try {
      await disconnectAccount(disconnectId);
      toast.success("Account disconnected");
      setDisconnectId(null);
      await loadAccounts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to disconnect");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sending accounts</CardTitle>
        <CardDescription>
          Connect Gmail or Outlook to send email campaigns from your own address
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading accounts...
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
              <MailIcon className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                No sending accounts connected
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Connect Gmail or Outlook to send campaigns from your inbox
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => handleConnect("gmail")}>
                Connect Gmail
              </Button>
              <Button
                variant="outline"
                onClick={() => handleConnect("outlook")}
              >
                Connect Outlook
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ProviderIcon provider={account.provider} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {account.email}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {account.provider}
                      </p>
                    </div>
                  </div>
                  <ConfirmationDialog
                    isOpen={disconnectId === account.id}
                    onClose={() => setDisconnectId(null)}
                    title="Disconnect account"
                    description={`Remove ${account.email}? You won't be able to send campaigns from this address until you reconnect.`}
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive shrink-0"
                        onClick={() => setDisconnectId(account.id)}
                      >
                        <Trash2Icon className="size-4 mr-1" />
                        Disconnect
                      </Button>
                    }
                    actionText="Disconnect"
                    onAction={handleDisconnect}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConnect("gmail")}
              >
                Connect Gmail
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConnect("outlook")}
              >
                Connect Outlook
              </Button>
            </div>
          </>
        )}
        <SmtpConfigForm userId={user?.id || ""} />
      </CardContent>
    </Card>
  );
}
