import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { Column, Section } from '../../types'
import { useEditorStore } from '../../store/editor'
import SortableBlock from './SortableBlock'

type Props = { section: Section; column: Column }

export default function ColumnArea({ section, column }: Props) {
  const { select } = useEditorStore()

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: {
      isColumn: true,
      sectionId: section.id,
      columnId: column.id,
    },
  })

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    select({ type: 'section', sectionId: section.id })
  }

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      className={`min-h-[48px] rounded transition-colors ${
        isOver ? 'bg-accent ring-2 ring-ring ring-inset' : ''
      } ${
        column.blocks.length === 0 ? 'border border-dashed border-border' : ''
      }`}
    >
      <SortableContext
        items={column.blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        {column.blocks.length === 0 ? (
          <div className="h-12 flex items-center justify-center text-xs text-muted-foreground/50">
            Drop blocks here
          </div>
        ) : (
          column.blocks.map((block) => (
            <SortableBlock
              key={block.id}
              block={block}
              sectionId={section.id}
              columnId={column.id}
            />
          ))
        )}
      </SortableContext>
    </div>
  )
}