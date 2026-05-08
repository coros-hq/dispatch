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
  className={`rounded-lg transition-all duration-150 ${
    column.blocks.length === 0
      ? `min-h-[80px] border-2 border-dashed flex items-center justify-center ${
          isOver
            ? 'border-primary bg-primary/10 scale-[1.02]'
            : 'border-border/50 hover:border-border'
        }`
      : isOver
      ? 'ring-2 ring-primary ring-inset bg-primary/5'
      : ''
  }`}
>
  <SortableContext
    items={column.blocks.map((b) => b.id)}
    strategy={verticalListSortingStrategy}
  >
    {column.blocks.length === 0 ? (
      <div className={`flex flex-col items-center gap-1 pointer-events-none transition-all ${
        isOver ? 'text-primary' : 'text-muted-foreground/40'
      }`}>
        <span className="text-lg">{isOver ? '↓' : '+'}</span>
        <span className="text-[10px]">
          {isOver ? 'Release to drop' : 'Drop blocks here'}
        </span>
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