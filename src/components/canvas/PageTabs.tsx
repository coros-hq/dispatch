import { useState, useRef } from "react";
import { useEditorStore } from "../../store/editor";
import { PlusIcon, XIcon } from "lucide-react";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { PLAN_LIMITS } from "@/lib/planLimits";
import { usePlanStore } from "@/store/plan";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";

export default function PageTabs() {
  const readOnly = useEditorStore((s) => s.readOnly);
  const {
    template,
    setActivePage,
    addPage,
    removePage,
    renamePage,
  } = useEditorStore();

  const { pages, activePageId } = template;
  const { plan } = usePlanStore();
  const atPageLimit = pages.length >= PLAN_LIMITS[plan].maxPagesPerProject;
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = (id: string, name: string) => {
    if (readOnly) return;
    setRenamingId(id);
    setRenameValue(name);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleRenameSubmit = () => {
    if (renamingId && renameValue.trim()) {
      renamePage(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  return (
    <div
      data-tour="page-tabs"
      className="h-9 border-t border-border bg-muted/50 flex items-center px-2 gap-1 overflow-x-auto shrink-0"
    >
      <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest px-1.5 shrink-0">
        Pages
      </span>
      {pages.map((page) => (
        <div
          key={page.id}
          onClick={() => setActivePage(page.id)}
          onDoubleClick={() => handleDoubleClick(page.id, page.name)}
          className={`flex items-center gap-1.5 px-2.5 h-7 rounded-md text-xs cursor-pointer shrink-0 group transition-colors ${
            page.id === activePageId
              ? "bg-card border border-border text-foreground font-medium shadow-sm"
              : "text-muted-foreground hover:bg-card/80 hover:text-foreground border border-transparent"
          }`}
        >
          {renamingId === page.id ? (
            <input
              ref={inputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit();
                if (e.key === "Escape") setRenamingId(null);
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent outline-none border-b border-primary w-20 text-xs"
            />
          ) : (
            <span>{page.name}</span>
          )}

          {pages.length > 1 && !readOnly && (
            <ConfirmationDialog
              isOpen={deleteDialogId === page.id}
              onClose={() => setDeleteDialogId(null)}
              title="Delete page"
              description={`Delete “${page.name}” and all its A/B variants? This cannot be undone.`}
              trigger={
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteDialogId(page.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive ml-0.5"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              }
              actionText="Delete"
              onAction={() => {
                removePage(page.id);
                setDeleteDialogId(null);
              }}
            />
          )}
        </div>
      ))}

      {!readOnly &&
        (atPageLimit ? (
          <UpgradePrompt
            feature="More pages"
            description="Free plan includes 2 pages per project."
            compact
          />
        ) : (
          <button
            onClick={addPage}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-card hover:text-foreground transition-colors shrink-0 cursor-pointer border border-dashed border-border/80"
            title="Add page"
          >
            <PlusIcon className="w-3.5 h-3.5" />
          </button>
        ))}
    </div>
  );
}
