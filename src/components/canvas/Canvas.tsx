import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useEditorStore } from '../../store/editor'
import SectionRow from './SectionRow'

export default function Canvas() {
  const { template, select, addSection, previewWidth, mode, previewTemplate } = useEditorStore()


  const activeTemplate = mode === 'preview' && previewTemplate
    ? previewTemplate
    : template

  const sections = activeTemplate.sections
  const isPreview = (mode === 'preview')

  return (
    <div
      className="min-h-full flex flex-col items-center py-10 px-6"
      onClick={() => !isPreview && select({ type: 'none' })}
    >
      {isPreview && (
        <div className="mb-4 text-xs text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-full">
          Preview — hover a template on the right to see it here
        </div>
      )}
      <div
        className={`w-full shadow-2xl rounded-xl overflow-hidden ${isPreview ? 'pointer-events-none' : ''}`}
        style={{
          maxWidth: previewWidth === 'mobile' ? 375 : activeTemplate.globalStyles.contentWidth,
          backgroundColor: activeTemplate.globalStyles.bgColor,
        }}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sections.length === 0 ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-xl">
                ✉
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Start building your newsletter
                </p>
                <p className="text-xs text-muted-foreground/50 mt-1">
                  Add a section from the left panel to get started
                </p>
              </div>
              <button
                onClick={() => addSection(1)}
                className="text-xs px-4 py-2 rounded-lg bg-muted border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
              >
                + Add first section
              </button>
            </div>
          ) : (
            sections.map((section) => (
              <SectionRow key={section.id} section={section} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}