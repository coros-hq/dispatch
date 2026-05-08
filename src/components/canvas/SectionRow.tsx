import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Section } from '../../types'
import { useEditorStore } from '../../store/editor'
import ColumnArea from './ColumnArea'

type Props = { section: Section }

export default function SectionRow({ section }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    data: { isSection: true },
  })
  const { selection, select, removeSection } = useEditorStore()
  const isSelected = selection.type === 'section' && selection.sectionId === section.id

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    select({ type: 'section', sectionId: section.id })
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: section.bgColor,
        paddingTop: section.paddingTop,
        paddingBottom: section.paddingBottom,
        paddingLeft: section.paddingLeft,
        paddingRight: section.paddingRight,
      }}
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
          onClick={(e) => { e.stopPropagation(); removeSection(section.id) }}
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
        >
          ×
        </button>
      )}

      {/* Columns */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${section.columns.length}, 1fr)` }}
      >
        {section.columns.map((column) => (
          <ColumnArea key={column.id} section={section} column={column} />
        ))}
      </div>
    </div>
  )
}