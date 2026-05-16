import { useState } from "react";
import { useEditorStore, getActiveCanvas } from "../../store/editor";
import { canvasToHtml } from "@/lib/renderer";
import { incrementUsage } from "@/lib/planService";
import { PLAN_LIMITS } from "@/lib/planLimits";
import { usePlanStore } from "@/store/plan";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const url = import.meta.env.DEV ? "/api/resend/emails" : "/api/resend";

export default function SendTestModal() {
  const { template } = useEditorStore();
  const { plan, testEmailsSent, campaignsSent, setUsage } = usePlanStore();
  const limit = PLAN_LIMITS[plan].maxTestEmailsPerMonth;
  const atLimit = limit !== Infinity && testEmailsSent >= limit;
  const [email, setEmail] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const layoutOptions = template.pages.flatMap((page) =>
    page.canvases.map((canvas) => ({
      id: canvas.id,
      label: `${page.name} · ${canvas.name}`,
      canvas,
    })),
  );
  const [selectedCanvasId, setSelectedCanvasId] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [open, setOpen] = useState(false);

  const handleSend = async () => {
    if (!email) return;
    if (atLimit) {
      setUpgradeOpen(true);
      return;
    }
    setStatus("sending");

    try {
      const found = layoutOptions.find((o) => o.id === selectedCanvasId);
      if (!found) throw new Error("Layout not found");

      const html = canvasToHtml(found.canvas);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "dispatch@coros.click",
          to: email,
          subject: `Test: ${template.name} — ${found.label}`,
          html,
        }),
      });

      if (res.ok) {
        await incrementUsage("test_emails_sent");
        setUsage(testEmailsSent + 1, campaignsSent);
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (val) {
      setSelectedCanvasId(getActiveCanvas(template).id);
      setStatus("idle");
      setEmail("");
    }
  };

  return (
    <>
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="Unlimited test emails"
      />
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Send test
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send test email</DialogTitle>
            <DialogDescription>
              Choose which page / variant to send and enter your email
            </DialogDescription>
          </DialogHeader>

          {status === "sent" ? (
            <div className="text-xs text-green-400 text-center py-4">
              ✓ Email sent — check your inbox
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {layoutOptions.length > 1 && (
                <div className="flex flex-col gap-1.5">
                  <Label>Layout</Label>
                  <Select
                    value={selectedCanvasId}
                    onValueChange={setSelectedCanvasId}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {layoutOptions.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <Label>Email address</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {testEmailsSent} / {limit === Infinity ? "∞" : limit} test
                emails this month
              </p>

              {status === "error" && (
                <p className="text-xs text-destructive">
                  Something went wrong. Check your API key.
                </p>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!email || status === "sending"}
                >
                  {status === "sending" ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
