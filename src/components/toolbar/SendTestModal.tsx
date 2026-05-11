import { useState } from "react";
import { useEditorStore } from "../../store/editor";
import { canvasToHtml } from "@/lib/renderer";
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

export default function SendTestModal() {
  const { template } = useEditorStore();
  const [email, setEmail] = useState("");
  const canvases = template.canvases ?? [];
  const [selectedCanvasId, setSelectedCanvasId] = useState(
    template.activeCanvasId ?? "",
  );
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [open, setOpen] = useState(false);

  const handleSend = async () => {
    if (!email) return;
    setStatus("sending");

    try {
      const canvas = template.canvases.find((c) => c.id === selectedCanvasId);
      if (!canvas) throw new Error("Canvas not found");

      const html = canvasToHtml(canvas);
      const res = await fetch("/api/resend/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "dispatch@coros.click",
          to: email,
          subject: `Test: ${template.name} — ${canvas.name}`,
          html,
        }),
      });

      if (res.ok) {
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
      setSelectedCanvasId(template.activeCanvasId);
      setStatus("idle");
      setEmail("");
    }
  };

  return (
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
            Choose which canvas to send and enter your email
          </DialogDescription>
        </DialogHeader>

        {status === "sent" ? (
          <div className="text-xs text-green-400 text-center py-4">
            ✓ Email sent — check your inbox
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {canvases.length > 1 && (
              <div className="flex flex-col gap-1.5">
                <Label>Canvas</Label>
                <Select
                  value={selectedCanvasId}
                  onValueChange={setSelectedCanvasId}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {canvases.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
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
  );
}
