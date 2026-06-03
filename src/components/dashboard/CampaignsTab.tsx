import { useCallback, useEffect, useState } from "react";
import { getCampaigns, type Campaign } from "@/lib/campaignService";
import { CampaignResults } from "@/components/toolbar/CampaignModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";

function StatusBadge({ status }: { status: Campaign["status"] }) {
  const variants: Record<
    Campaign["status"],
    { label: string; className: string }
  > = {
    sending: {
      label: "Sending",
      className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    done: {
      label: "Done",
      className: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    failed: {
      label: "Failed",
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
  };
  const v = variants[status];
  return (
    <Badge variant="outline" className={v.className}>
      {v.label}
    </Badge>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const { user } = useAuthStore(); // to trigger re-render on user change

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCampaigns(user?.id ?? "");
      setCampaigns(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load campaigns",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="grid gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <p className="text-sm font-medium text-foreground">No campaigns yet</p>
        <p className="text-xs text-muted-foreground">
          Open a project in the editor and click Send campaign to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Subject
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                From
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Recipients
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Sent
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Failed
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Date
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr
                key={c.id}
                className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelected(c)}
              >
                <td className="px-4 py-3 font-medium max-w-[200px] truncate">
                  {c.subject}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {c.from_name} &lt;{c.from_email}&gt;
                </td>
                <td className="px-4 py-3 text-right">{c.recipient_count}</td>
                <td className="px-4 py-3 text-right text-green-500">
                  {c.sent_count}
                </td>
                <td className="px-4 py-3 text-right text-destructive">
                  {c.failed_count}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(c.created_at)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="flex flex-col gap-3">
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  From: {selected.from_name} &lt;{selected.from_email}&gt;
                </p>
                <p>Date: {formatDate(selected.created_at)}</p>
                <p>
                  Recipients: {selected.recipient_count} · Sent:{" "}
                  {selected.sent_count} · Failed: {selected.failed_count}
                </p>
              </div>
              <CampaignResults
                sent={selected.sent_count}
                failed={selected.failed_recipients ?? []}
                readOnly
              />
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
