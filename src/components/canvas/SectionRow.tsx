import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Section } from "../../types";
import { useEditorStore } from "../../store/editor";
import ColumnArea from "./ColumnArea";

type Props = { section: Section };

export default function SectionRow({ section }: Props) {
  const readOnly = useEditorStore((s) => s.readOnly);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    data: { isSection: true },
    disabled: readOnly,
  });
  const { selection, select, removeSection } = useEditorStore();
  const isSelected =
    selection.type === "section" && selection.sectionId === section.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    select({ type: "section", sectionId: section.id });
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        marginTop: section.marginTop ?? 0,
        marginBottom: section.marginBottom ?? 0,
        marginLeft: section.marginLeft ?? 0,
        marginRight: section.marginRight ?? 0,
      }}
      onClick={handleClick}
      className={`relative group ${isSelected ? "ring-2 ring-ring ring-inset" : ""}`}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none pb-1">
        <span className="text-[10px] bg-card border border-border text-muted-foreground px-2 py-0.5 rounded-md whitespace-nowrap">
          Click to edit section
        </span>
      </div>
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full opacity-0 group-hover:opacity-100 transition-opacity px-1 cursor-grab active:cursor-grabbing z-10"
      >
        <div className="flex flex-col gap-[2px] p-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-muted-foreground" />
          ))}
        </div>
      </div>

      {/* Delete button */}
      {isSelected && !readOnly && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeSection(section.id);
          }}
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
        >
          ×
        </button>
      )}

      <div
        style={{
          backgroundColor: section.bgColor,
          paddingTop: section.paddingTop,
          paddingBottom: section.paddingBottom,
          paddingLeft: section.paddingLeft,
          paddingRight: section.paddingRight,
          borderRadius: section.borderRadius ?? 0,
          border: section.borderWidth
            ? `${section.borderWidth}px solid ${section.borderColor ?? "transparent"}`
            : "none",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: section.columnGap ?? 8,
            alignItems: "stretch",
          }}
        >
          {section.columns.map((column) => (
            <ColumnArea
              key={column.id}
              column={column}
              sectionId={section.id}
              style={{
                flex: column.width ? `0 0 ${column.width}%` : 1,
                minWidth: 0,
                minHeight: 60,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
