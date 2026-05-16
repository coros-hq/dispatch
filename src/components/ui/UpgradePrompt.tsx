import { useState } from "react";
import { ZapIcon } from "lucide-react";
import { Button } from "./button";
import { UpgradeModal } from "./UpgradeModal";

type Props = {
  feature: string;
  description: string;
  compact?: boolean;
};

export function UpgradePrompt({ feature, description, compact = false }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <UpgradeModal open={open} onClose={() => setOpen(false)} feature={feature} />

      {compact ? (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <ZapIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-400 flex-1">{description}</p>
          <Button
            size="sm"
            className="h-6 text-[10px] px-2 bg-amber-500 hover:bg-amber-600 text-black shrink-0"
            onClick={() => setOpen(true)}
          >
            Upgrade
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border text-center">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
            <ZapIcon className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{feature}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-black font-medium"
            onClick={() => setOpen(true)}
          >
            Upgrade to Pro
          </Button>
        </div>
      )}
    </>
  );
}
