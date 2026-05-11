import { useState, useRef } from "react";
import { useEditorStore } from "../../store/editor";
import { PlusIcon, XIcon } from "lucide-react";
import { ConfirmationDialog } from "../ConfirmationDialog";

export default function CanvasTabs() {
  const { template, setActiveCanvas, addCanvas, removeCanvas, renameCanvas } =
    useEditorStore();

  const { canvases, activeCanvasId } = template;
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = (id: string, name: string) => {
    setRenamingId(id);
    setRenameValue(name);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleRenameSubmit = () => {
    if (renamingId && renameValue.trim()) {
      renameCanvas(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  return (
    <div className="h-10 border-t border-border bg-card flex items-center px-2 gap-1 overflow-x-auto shrink-0">
      {canvases.map((canvas) => (
        <div
          key={canvas.id}
          onClick={() => setActiveCanvas(canvas.id)}
          onDoubleClick={() => handleDoubleClick(canvas.id, canvas.name)}
          className={`flex items-center gap-1.5 px-3 h-7 rounded-md text-xs cursor-pointer shrink-0 group transition-colors ${
            canvas.id === activeCanvasId
              ? "bg-accent text-foreground font-medium"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          }`}
        >
          {renamingId === canvas.id ? (
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
            <span>{canvas.name}</span>
          )}

          {canvases.length > 1 && (
            <ConfirmationDialog
              isOpen={deleteDialogId === canvas.id}
              onClose={() => setDeleteDialogId(null)}
              title="Delete canvas"
              description={`Are you sure you want to delete "${canvas.name}"? This cannot be undone.`}
              trigger={
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteDialogId(canvas.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive ml-1"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              }
              actionText="Delete"
              onAction={() => {
                removeCanvas(canvas.id);
                setDeleteDialogId(null);
              }}
            />
          )}
        </div>
      ))}

      <button
        onClick={addCanvas}
        className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0 cursor-pointer"
      >
        <PlusIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
