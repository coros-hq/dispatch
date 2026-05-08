import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Block } from '../../types'
import { useEditorStore } from '../../store/editor'
import BlockRenderer from './BlockRenderer'

type Props = {
  block: Block
  sectionId: string
  columnId: string
}

export default function SortableBlock({ block, sectionId, columnId }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: {
      isBlock: true,
      sectionId,
      columnId,
      blockId: block.id,
    },
  })
  const { selection, select, removeBlock } = useEditorStore()
  const isSelected =
    selection.type === 'block' &&
    selection.blockId === block.id

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    select({ type: 'block', sectionId, columnId, blockId: block.id })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      className={`relative group ${isSelected ? 'ring-2 ring-ring ring-inset' : ''}`}
    >
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
      {isSelected && (
        <button
          onClick={(e) => { e.stopPropagation(); removeBlock(sectionId, columnId, block.id) }}
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
        >
          ×
        </button>
      )}

      <BlockRenderer block={block} />
    </div>
  )
}