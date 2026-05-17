import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ZapIcon, CheckIcon, XIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";

type Props = {
  open: boolean;
  onClose: () => void;
  feature?: string;
};

type ComparisonRow = {
  name: string;
  free: string | boolean;
  pro: string | boolean;
};

const COMPARISON: ComparisonRow[] = [
  { name: "Projects", free: "3", pro: "Unlimited" },
  { name: "Pages per project", free: "2", pro: "Unlimited" },
  { name: "Test emails / month", free: "100", pro: "Unlimited" },
  { name: "Campaign contacts", free: "500", pro: "Unlimited" },
  { name: "Team workspaces", free: false, pro: true },
  { name: "Image upload", free: false, pro: true },
  { name: "Custom sending domain", free: false, pro: true },
  { name: "Community templates", free: false, pro: true },
  { name: "Version history", free: false, pro: true },
];

const FEATURE_KEYWORDS: Record<string, string[]> = {
  Projects: ["project"],
  "Pages per project": ["page"],
  "Test emails / month": ["test email", "email"],
  "Campaign contacts": ["campaign", "contact"],
  "Team workspaces": ["team", "workspace"],
  "Image upload": ["image", "upload"],
  "Custom sending domain": ["domain", "custom"],
  "Community templates": ["community", "template", "public"],
  "Version history": ["version", "history"],
};

function isRowHighlighted(rowName: string, feature?: string): boolean {
  if (!feature) return false;
  const f = feature.toLowerCase();
  const keywords = FEATURE_KEYWORDS[rowName] ?? [rowName.toLowerCase()];
  return keywords.some((k) => f.includes(k));
}

function CellValue({
  value,
  isPro,
}: {
  value: string | boolean;
  isPro: boolean;
}) {
  if (typeof value === "boolean") {
    return value ? (
      <CheckIcon
        className={`w-4 h-4 mx-auto ${isPro ? "text-amber-400" : "text-muted-foreground/30"}`}
      />
    ) : (
      <XIcon className="w-4 h-4 mx-auto text-muted-foreground/30" />
    );
  }
  return (
    <span
      className={`text-sm ${isPro ? "text-amber-400 font-medium" : "text-muted-foreground"}`}
    >
      {value}
    </span>
  );
}

type ContentProps = {
  feature?: string;
  defaultEmail: string;
  onClose: () => void;
};

function UpgradeModalContent({
  feature,
  defaultEmail,
  onClose,
}: ContentProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await supabase.from("pro_waitlist").insert({
        email: email.trim(),
        requested_feature: feature ?? null,
      });
    } finally {
      setSubmitted(true);
      setLoading(false);
    }
  };

  return (
    <>
      <DialogHeader className="px-6 pt-6 pb-4 space-y-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 ring-1 ring-amber-500/20 flex items-center justify-center shrink-0">
              <ZapIcon className="w-4 h-4 text-amber-400" />
            </div>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Upgrade to Pro
            </DialogTitle>
          </div>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 px-6 pb-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-500/10 ring-1 ring-green-500/20 flex items-center justify-center">
              <CheckIcon className="w-7 h-7 text-green-400" />
            </div>
            <p className="text-base font-semibold text-foreground">
              You&apos;re on the list!
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              We&apos;ll reach out to{" "}
              <strong className="text-foreground">{email}</strong> shortly with
              early access to MailShot Pro.
            </p>
            <Button onClick={onClose} className="mt-2">
              Close
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 px-6 pb-6">
            {feature && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
                <ZapIcon className="w-3.5 h-3.5 shrink-0" />
                <span>
                  You&apos;ve reached the limit for:{" "}
                  <strong className="font-semibold">{feature}</strong>
                </span>
              </div>
            )}

            <div className="rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="grid grid-cols-[1fr_96px_120px] sm:grid-cols-[1fr_110px_140px] bg-muted/50">
                <div className="px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                  Feature
                </div>
                <div className="px-2 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-widest text-center">
                  Free
                </div>
                <div className="px-2 py-2.5 text-[10px] font-semibold text-amber-400 uppercase tracking-widest text-center bg-linear-to-b from-amber-500/10 to-amber-500/5 border-l border-amber-500/25">
                  Pro ⚡
                </div>
              </div>

              {COMPARISON.map((row, i) => {
                const highlighted = isRowHighlighted(row.name, feature);
                return (
                  <div
                    key={row.name}
                    className={`grid grid-cols-[1fr_96px_120px] sm:grid-cols-[1fr_110px_140px] border-t border-border transition-colors ${
                      highlighted
                        ? "bg-amber-500/8 ring-1 ring-inset ring-amber-500/20"
                        : i % 2 === 1
                          ? "bg-muted/25"
                          : ""
                    }`}
                  >
                    <div
                      className={`px-4 py-2.5 text-sm ${
                        highlighted
                          ? "text-amber-400 font-medium"
                          : "text-foreground"
                      }`}
                    >
                      {row.name}
                    </div>
                    <div className="px-2 py-2.5 flex items-center justify-center">
                      <CellValue value={row.free} isPro={false} />
                    </div>
                    <div className="px-2 py-2.5 flex items-center justify-center bg-amber-500/6 border-l border-amber-500/20">
                      <CellValue value={row.pro} isPro={true} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 pt-1">
              <p className="text-xs text-muted-foreground text-center">
                Pro is coming soon — join the waitlist for early access
              </p>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <Button
                onClick={handleSubmit}
                disabled={loading || !email.trim()}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium h-10"
              >
                {loading ? "Joining…" : "Join Pro waitlist — Early access"}
              </Button>
              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                No commitment · No credit card · We&apos;ll reach out when Pro is
                ready
              </p>
            </div>
          </div>
        )}
    </>
  );
}

export function UpgradeModal({ open, onClose, feature }: Props) {
  const { user } = useAuthStore();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-[calc(80%-2rem)] sm:max-w-lg gap-0 p-0 overflow-hidden">
        {open ? (
          <UpgradeModalContent
            key={feature ?? "upgrade"}
            feature={feature}
            defaultEmail={user?.email ?? ""}
            onClose={onClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
