import { useDraggable } from '@dnd-kit/core'
import { useEditorStore } from '../../store/editor'
import { Separator } from '@/components/ui/separator'

const BLOCKS = [
  {
    label: 'Text',
    icon: 'T',
    description: 'Heading or paragraph',
    default: { type: 'text' as const, content: 'New text block', fontSize: 16, color: '#111111', align: 'left' as const, fontWeight: 'normal' as const },
  },
  {
    label: 'Image',
    icon: '⌗',
    description: 'Embed an image',
    default: { type: 'image' as const, src: 'https://placehold.co/600x200', alt: 'Image', width: 600 },
  },
  {
    label: 'Button',
    icon: '⬡',
    description: 'Call to action',
    default: { type: 'button' as const, label: 'Click me', href: 'https://example.com', bgColor: '#111111', textColor: '#ffffff', borderRadius: 6 },
  },
  {
    label: 'Divider',
    icon: '—',
    description: 'Horizontal rule',
    default: { type: 'divider' as const, color: '#dddddd', thickness: 1 },
  },
  {
    label: 'Spacer',
    icon: '↕',
    description: 'Vertical spacing',
    default: { type: 'spacer' as const, height: 24 },
  },
]

const SECTIONS = [
  { label: 'Full width', icon: '▬', columns: 1 as const },
  { label: 'Two columns', icon: '⊟', columns: 2 as const },
  { label: 'Three columns', icon: '☰', columns: 3 as const },
]

function DraggablePaletteItem({ block }: { block: typeof BLOCKS[number] }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${block.label}`,
    data: {
      isPaletteItem: true,
      blockDefault: block.default,
    },
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors group cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <span className="w-7 h-7 flex items-center justify-center rounded-md bg-muted text-muted-foreground text-xs font-mono group-hover:bg-accent-foreground/10 group-hover:text-foreground transition-colors shrink-0">
        {block.icon}
      </span>
      <div>
        <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {block.label}
        </p>
        <p className="text-[10px] text-muted-foreground/50">{block.description}</p>
      </div>
    </div>
  )
}

export default function BlockPanel() {
  const { addSection } = useEditorStore()

  return (
    <div className="p-3 flex flex-col gap-4">
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2 px-1">
          Sections
        </p>
        <div className="flex flex-col gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s.label}
              onClick={() => addSection(s.columns)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-accent transition-colors group cursor-pointer"
            >
              <span className="w-7 h-7 flex items-center justify-center rounded-md bg-muted text-muted-foreground text-xs font-mono group-hover:bg-accent-foreground/10 group-hover:text-foreground transition-colors shrink-0">
                {s.icon}
              </span>
              <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {s.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2 px-1">
          Blocks
        </p>
        <div className="flex flex-col gap-1">
          {BLOCKS.map((block) => (
            <DraggablePaletteItem key={block.label} block={block} />
          ))}
        </div>
      </div>
    </div>
  )
}