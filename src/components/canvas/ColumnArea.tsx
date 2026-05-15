import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Column } from "../../types";
import { useEditorStore } from "../../store/editor";
import SortableBlock from "./SortableBlock";

type Props = {
  column: Column;
  sectionId: string;
  style?: React.CSSProperties;
};

function columnContentJustify(v?: Column["verticalAlign"]) {
  if (v === "middle") return "center";
  if (v === "bottom") return "flex-end";
  return "flex-start";
}

export default function ColumnArea({ column, sectionId, style }: Props) {
  const { select } = useEditorStore();

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: {
      isColumn: true,
      sectionId: sectionId,
      columnId: column.id,
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    select({ type: "section", sectionId: sectionId });
  };

  const hasBlocks = column.blocks.length > 0;
  const verticalLayout = hasBlocks
    ? {
        display: "flex" as const,
        flexDirection: "column" as const,
        justifyContent: columnContentJustify(column.verticalAlign),
      }
    : {};

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      style={{ ...style, minHeight: 60, ...verticalLayout }}
      className={`rounded-lg transition-all duration-150 ${
        column.blocks.length === 0
          ? `min-h-[48px] border-2 border-dashed flex items-center justify-center ${
              isOver
                ? "border-primary bg-primary/10"
                : "border-border/50 hover:border-border"
            }`
          : isOver
            ? "ring-2 ring-primary ring-inset bg-primary/5"
            : ""
      }`}
    >
      <SortableContext
        items={column.blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        {column.blocks.length === 0 ? (
          <div
            className={`flex flex-col items-center gap-1 pointer-events-none transition-all ${
              isOver ? "text-primary" : "text-muted-foreground/40"
            }`}
          >
            <span className="text-lg">{isOver ? "↓" : "+"}</span>
            <span className="text-[10px]">
              {isOver ? "Release to drop" : "Drop blocks here"}
            </span>
          </div>
        ) : (
          column.blocks.map((block) => (
            <SortableBlock
              key={block.id}
              block={block}
              sectionId={sectionId}
              columnId={column.id}
            />
          ))
        )}
      </SortableContext>
    </div>
  );
}
