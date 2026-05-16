import { useState, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEditorStore, getActivePage } from "../../store/editor";
import type { Canvas } from "../../types";
import { PlusIcon, XIcon } from "lucide-react";
import { ConfirmationDialog } from "../ConfirmationDialog";

type TabProps = {
  canvas: Canvas;
  isActive: boolean;
  readOnly: boolean;
  renamingId: string | null;
  renameValue: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  deleteDialogId: string | null;
  canvasesLength: number;
  onSelect: () => void;
  onDoubleClickRename: () => void;
  onRenameChange: (value: string) => void;
  onRenameSubmit: () => void;
  onRenameCancel: () => void;
  onDeleteOpen: (e: React.MouseEvent) => void;
  onDeleteConfirm: () => void;
  onDeleteClose: () => void;
};

function SortableCanvasTab({
  canvas,
  isActive,
  readOnly,
  renamingId,
  renameValue,
  inputRef,
  deleteDialogId,
  canvasesLength,
  onSelect,
  onDoubleClickRename,
  onRenameChange,
  onRenameSubmit,
  onRenameCancel,
  onDeleteOpen,
  onDeleteConfirm,
  onDeleteClose,
}: TabProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: canvas.id, disabled: readOnly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onSelect}
      onDoubleClick={onDoubleClickRename}
      className={`flex items-center gap-1.5 px-3 h-7 rounded-md text-xs cursor-pointer shrink-0 group transition-colors ${
        isActive
          ? "bg-accent text-foreground font-medium"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      }`}
    >
      {renamingId === canvas.id ? (
        <input
          ref={inputRef}
          value={renameValue}
          onChange={(e) => onRenameChange(e.target.value)}
          onBlur={onRenameSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") onRenameSubmit();
            if (e.key === "Escape") onRenameCancel();
          }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="bg-transparent outline-none border-b border-primary w-20 text-xs"
        />
      ) : (
        <span>{canvas.name}</span>
      )}

      {canvasesLength > 1 && !readOnly && (
        <ConfirmationDialog
          isOpen={deleteDialogId === canvas.id}
          onClose={onDeleteClose}
          title="Remove variant"
          description={`Remove “${canvas.name}” from this page? This cannot be undone.`}
          trigger={
            <button
              onClick={onDeleteOpen}
              onPointerDown={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive ml-1"
            >
              <XIcon className="w-3 h-3" />
            </button>
          }
          actionText="Delete"
          onAction={onDeleteConfirm}
        />
      )}
    </div>
  );
}

export default function CanvasTabs() {
  const template = useEditorStore((s) => s.template);
  const readOnly = useEditorStore((s) => s.readOnly);
  const {
    setActiveCanvas,
    addCanvas,
    removeCanvas,
    renameCanvas,
    reorderCanvases,
  } = useEditorStore();
  const page = getActivePage(template);
  const { canvases, activeCanvasId } = page;
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDoubleClick = (id: string, name: string) => {
    if (readOnly) return;
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

  const tabProps = (canvas: Canvas) => ({
    canvas,
    isActive: canvas.id === activeCanvasId,
    readOnly,
    renamingId,
    renameValue,
    inputRef,
    deleteDialogId,
    canvasesLength: canvases.length,
    onSelect: () => setActiveCanvas(canvas.id),
    onDoubleClickRename: () => handleDoubleClick(canvas.id, canvas.name),
    onRenameChange: setRenameValue,
    onRenameSubmit: handleRenameSubmit,
    onRenameCancel: () => setRenamingId(null),
    onDeleteOpen: (e: React.MouseEvent) => {
      e.stopPropagation();
      setDeleteDialogId(canvas.id);
    },
    onDeleteConfirm: () => {
      removeCanvas(canvas.id);
      setDeleteDialogId(null);
    },
    onDeleteClose: () => setDeleteDialogId(null),
  });

  return (
    <div
      data-tour="variant-tabs"
      className="h-10 border-t border-border bg-card flex items-center px-2 gap-1 overflow-x-auto shrink-0"
    >
      <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest px-1.5 shrink-0">
        Variants
      </span>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (over && active.id !== over.id) {
            reorderCanvases(page.id, active.id as string, over.id as string);
          }
        }}
      >
        <SortableContext
          items={canvases.map((c) => c.id)}
          strategy={horizontalListSortingStrategy}
        >
          {canvases.map((canvas) => (
            <SortableCanvasTab key={canvas.id} {...tabProps(canvas)} />
          ))}
        </SortableContext>
      </DndContext>

      {!readOnly && (
        <button
          onClick={addCanvas}
          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0 cursor-pointer"
        >
          <PlusIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
