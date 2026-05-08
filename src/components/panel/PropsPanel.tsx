import { useEditorStore } from '../../store/editor'
import type { Block } from '../../types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export default function PropsPanel() {
  const { selection, template, updateBlock, updateGlobalStyles, updateSection } = useEditorStore()

  if (selection.type === 'none') {
    return (
      <div className="p-4 flex flex-col gap-4">
        <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest">
          Global styles
        </p>
        <Field label="Canvas background">
          <input
            type="color"
            className="w-full h-8 rounded cursor-pointer border border-border" value={template.globalStyles.bgColor}
            onChange={(e) => updateGlobalStyles({ bgColor: e.target.value })}
          />
        </Field>
        <Field label="Content width">
          <Input
            type="number"
            value={template.globalStyles.contentWidth}
            onChange={(e) => updateGlobalStyles({ contentWidth: Number(e.target.value) })}
          />
        </Field>
        <Field label="Font family">
          <Select
            value={template.globalStyles.fontFamily}
            onValueChange={(v) => updateGlobalStyles({ fontFamily: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inter, sans-serif">Inter</SelectItem>
              <SelectItem value="Arial, sans-serif">Arial</SelectItem>
              <SelectItem value="Georgia, serif">Georgia</SelectItem>
              <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
              <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
    )
  }

  if (selection.type === 'section') {
    const section = template.sections.find((s) => s.id === selection.sectionId)
    if (!section) return null

    return (
      <div className="p-4 flex flex-col gap-4">
        <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest">
          Section
        </p>
        <Field label="Background">
          <input
            type="color"
            className="w-full h-8 rounded cursor-pointer"
            value={section.bgColor}
            onChange={(e) => updateSection(section.id, { bgColor: e.target.value })}
          />
        </Field>
        <Field label="Padding top">
          <Input
            type="number"
            value={section.paddingTop}
            onChange={(e) => updateSection(section.id, { paddingTop: Number(e.target.value) })}
          />
        </Field>
        <Field label="Padding bottom">
          <Input
            type="number"
            value={section.paddingBottom}
            onChange={(e) => updateSection(section.id, { paddingBottom: Number(e.target.value) })}
          />
        </Field>
        <Field label="Padding left">
          <Input
            type="number"
            value={section.paddingLeft}
            onChange={(e) => updateSection(section.id, { paddingLeft: Number(e.target.value) })}
          />
        </Field>
        <Field label="Padding right">
          <Input
            type="number"
            value={section.paddingRight}
            onChange={(e) => updateSection(section.id, { paddingRight: Number(e.target.value) })}
          />
        </Field>
      </div>
    )
  }

  if (selection.type === 'block') {
    const section = template.sections.find((s) => s.id === selection.sectionId)
    const column = section?.columns.find((c) => c.id === selection.columnId)
    const block = column?.blocks.find((b) => b.id === selection.blockId)
    if (!block || !section || !column) return null

    const update = (changes: Partial<Block>) =>
      updateBlock(section.id, column.id, block.id, changes)

    return (
      <div className="p-4 flex flex-col gap-4">
        <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest">
          {block.type}
        </p>

        {block.type === 'text' && (
          <>
            <Field label="Content">
              <Textarea
                className="h-20 resize-none"
                value={block.content}
                onChange={(e) => update({ content: e.target.value })}
              />
            </Field>
            <Field label="Font size">
              <Input
                type="number"
                value={block.fontSize}
                onChange={(e) => update({ fontSize: Number(e.target.value) })}
              />
            </Field>
            <Field label="Color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer"
                value={block.color}
                onChange={(e) => update({ color: e.target.value })}
              />
            </Field>
            <Field label="Align">
              <Select
                value={block.align}
                onValueChange={(v) => update({ align: v as 'left' | 'center' | 'right' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Weight">
              <Select
                value={block.fontWeight}
                onValueChange={(v) => update({ fontWeight: v as 'normal' | 'bold' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </>
        )}

        {block.type === 'image' && (
          <>
            <Field label="URL">
              <Input
                value={block.src}
                onChange={(e) => update({ src: e.target.value })}
              />
            </Field>
            <Field label="Alt text">
              <Input
                value={block.alt}
                onChange={(e) => update({ alt: e.target.value })}
              />
            </Field>
            <Field label="Width">
              <Input
                type="number"
                value={block.width}
                onChange={(e) => update({ width: Number(e.target.value) })}
              />
            </Field>
          </>
        )}

        {block.type === 'button' && (
          <>
            <Field label="Label">
              <Input
                value={block.label}
                onChange={(e) => update({ label: e.target.value })}
              />
            </Field>
            <Field label="URL">
              <Input
                value={block.href}
                onChange={(e) => update({ href: e.target.value })}
              />
            </Field>
            <Field label="Background">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer"
                value={block.bgColor}
                onChange={(e) => update({ bgColor: e.target.value })}
              />
            </Field>
            <Field label="Text color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer"
                value={block.textColor}
                onChange={(e) => update({ textColor: e.target.value })}
              />
            </Field>
            <Field label="Border radius">
              <Input
                type="number"
                value={block.borderRadius}
                onChange={(e) => update({ borderRadius: Number(e.target.value) })}
              />
            </Field>
          </>
        )}

        {block.type === 'divider' && (
          <>
            <Field label="Color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer"
                value={block.color}
                onChange={(e) => update({ color: e.target.value })}
              />
            </Field>
            <Field label="Thickness">
              <Input
                type="number"
                value={block.thickness}
                onChange={(e) => update({ thickness: Number(e.target.value) })}
              />
            </Field>
          </>
        )}

        {block.type === 'spacer' && (
          <Field label="Height">
            <Input
              type="number"
              value={block.height}
              onChange={(e) => update({ height: Number(e.target.value) })}
            />
          </Field>
        )}
      </div>
    )
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[11px] text-white/40">{label}</Label>
      {children}
    </div>
  )
}