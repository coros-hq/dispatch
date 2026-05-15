import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState } from "react";
import { useEditorStore, getActivePage } from "../store/editor";
import type { Block } from "../types";
import BlockRenderer from "./canvas/BlockRenderer";

export default function DndProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { addBlock, reorderBlocks, reorderSections } = useEditorStore();
  const [activeBlock, setActiveBlock] = useState<Omit<Block, "id"> | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.isPaletteItem) {
      setActiveBlock(data.blockDefault);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveBlock(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Palette block dropped into a column
    if (activeData?.isPaletteItem && overData?.isColumn) {
      // Auto-select the canvas this column belongs to
      const page = getActivePage(useEditorStore.getState().template);
      const canvas = page.canvases.find((c) =>
        c.sections.some((s) =>
          s.columns.some((col) => col.id === overData.columnId),
        ),
      );
      if (canvas) {
        useEditorStore.getState().setActiveCanvas(canvas.id);
      }
      addBlock(overData.sectionId, overData.columnId, activeData.blockDefault);
      return;
    }

    // Block reordered within a column
    if (activeData?.isBlock && overData?.isBlock) {
      if (activeData.columnId === overData.columnId) {
        reorderBlocks(
          activeData.sectionId,
          activeData.columnId,
          String(active.id),
          String(over.id),
        );
      }
      return;
    }

    // Section reordered
    if (activeData?.isSection && overData?.isSection) {
      if (active.id !== over.id) {
        reorderSections(String(active.id), String(over.id));
      }
      return;
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>
        {activeBlock && (
          <div className="bg-white rounded shadow-xl opacity-90 w-[300px] pointer-events-none">
            <BlockRenderer block={{ ...activeBlock, id: "preview" } as Block} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
