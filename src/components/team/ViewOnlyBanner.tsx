import { EyeIcon } from "lucide-react";

export function ViewOnlyBanner() {
  return (
    <div
      className="shrink-0 flex items-center justify-center gap-2 px-4 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-200 text-xs"
      role="status"
    >
      <EyeIcon className="w-3.5 h-3.5 shrink-0" />
      <span>View-only — you can preview this project but cannot make changes</span>
    </div>
  );
}
