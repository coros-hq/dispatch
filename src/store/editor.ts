import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type { Block, Column, GlobalStyles, Section, Template } from '../types'
import { persist } from 'zustand/middleware'

type SelectionState =
  | { type: 'none' }
  | { type: 'section'; sectionId: string }
  | { type: 'block'; sectionId: string; columnId: string; blockId: string }

type EditorMode = 'edit' | 'preview'


type EditorStore = {
  template: Template
  selection: SelectionState
  mode: EditorMode

  // Mode
  previewTemplate: Template | null;
  setMode: (mode: EditorMode) => void;
  setPreviewTemplate: (template: Template | null) => void;

  // Section actions
  addSection: (columnCount: 1 | 2 | 3) => void
  updateSection: (sectionId: string, changes: Partial<Omit<Section, 'id' | 'columns'>>) => void
  removeSection: (sectionId: string) => void
  reorderSections: (activeId: string, overId: string) => void

  renameTemplate: (name: string) => void

  // Block actions
  addBlock: (sectionId: string, columnId: string, block: Omit<Block, 'id'>) => void
  updateBlock: (sectionId: string, columnId: string, blockId: string, changes: Partial<Block>) => void
  removeBlock: (sectionId: string, columnId: string, blockId: string) => void
  reorderBlocks: (sectionId: string, columnId: string, activeId: string, overId: string) => void

  // Selection
  select: (selection: SelectionState) => void

  // Global styles
  updateGlobalStyles: (changes: Partial<GlobalStyles>) => void

  // Template
  setTemplate: (template: Template) => void
}

function makeColumn(): Column {
  return { id: uuid(), blocks: [] }
}

function makeSection(columnCount: 1 | 2 | 3): Section {
  return {
    id: uuid(),
    columns: Array.from({ length: columnCount }, makeColumn),
    bgColor: '#ffffff',
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 24,
    paddingRight: 24,
  }
}

const defaultTemplate: Template = {
  id: uuid(),
  name: 'Untitled',
  sections: [],
  globalStyles: {
    fontFamily: 'Inter, sans-serif',
    bgColor: '#f4f4f4',
    contentWidth: 600,
  },
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      template: defaultTemplate,
      selection: { type: 'none' },
      mode: 'edit',
      previewTemplate: null,

      setMode: (mode) => set({ mode }),
      setPreviewTemplate: (template) => set({ previewTemplate: template }),

      addSection: (columnCount) =>
        set((state) => ({
          template: {
            ...state.template,
            sections: [...state.template.sections, makeSection(columnCount)],
          },
        })),

      updateSection: (sectionId, changes) =>
        set((state) => ({
          template: {
            ...state.template,
            sections: state.template.sections.map((s) =>
              s.id === sectionId ? { ...s, ...changes } : s
            ),
          },
        })),

      removeSection: (sectionId) =>
        set((state) => ({
          template: {
            ...state.template,
            sections: state.template.sections.filter((s) => s.id !== sectionId),
          },
          selection: { type: 'none' },
        })),

      reorderSections: (activeId, overId) =>
        set((state) => {
          const sections = [...state.template.sections]
          const oldIndex = sections.findIndex((s) => s.id === activeId)
          const newIndex = sections.findIndex((s) => s.id === overId)
          if (oldIndex === -1 || newIndex === -1) return state
          const [moved] = sections.splice(oldIndex, 1)
          sections.splice(newIndex, 0, moved)
          return { template: { ...state.template, sections } }
        }),

      addBlock: (sectionId, columnId, block) =>
        set((state) => ({
          template: {
            ...state.template,
            sections: state.template.sections.map((s) =>
              s.id !== sectionId ? s : {
                ...s,
                columns: s.columns.map((c) =>
                  c.id !== columnId ? c : {
                    ...c,
                    blocks: [...c.blocks, { ...block, id: uuid() } as Block],
                  }
                ),
              }
            ),
          },
        })),

      updateBlock: (sectionId, columnId, blockId, changes) =>
        set((state) => ({
          template: {
            ...state.template,
            sections: state.template.sections.map((s) =>
              s.id !== sectionId ? s : {
                ...s,
                columns: s.columns.map((c) =>
                  c.id !== columnId ? c : {
                    ...c,
                    blocks: c.blocks.map((b) =>
                      b.id === blockId ? { ...b, ...changes } as Block : b
                    ),
                  }
                ),
              }
            ),
          },
        })),

      removeBlock: (sectionId, columnId, blockId) =>
        set((state) => ({
          template: {
            ...state.template,
            sections: state.template.sections.map((s) =>
              s.id !== sectionId ? s : {
                ...s,
                columns: s.columns.map((c) =>
                  c.id !== columnId ? c : {
                    ...c,
                    blocks: c.blocks.filter((b) => b.id !== blockId),
                  }
                ),
              }
            ),
          },
          selection: { type: 'none' },
        })),

      reorderBlocks: (sectionId, columnId, activeId, overId) =>
        set((state) => ({
          template: {
            ...state.template,
            sections: state.template.sections.map((s) =>
              s.id !== sectionId ? s : {
                ...s,
                columns: s.columns.map((c) => {
                  if (c.id !== columnId) return c
                  const blocks = [...c.blocks]
                  const oldIndex = blocks.findIndex((b) => b.id === activeId)
                  const newIndex = blocks.findIndex((b) => b.id === overId)
                  if (oldIndex === -1 || newIndex === -1) return c
                  const [moved] = blocks.splice(oldIndex, 1)
                  blocks.splice(newIndex, 0, moved)
                  return { ...c, blocks }
                }),
              }
            ),
          },
        })),

      renameTemplate: (name: string) =>
        set((state) => ({
          template: { ...state.template, name },
        })),

      select: (selection) => set({ selection }),

      updateGlobalStyles: (changes) =>
        set((state) => ({
          template: {
            ...state.template,
            globalStyles: { ...state.template.globalStyles, ...changes },
          },
        })),

      setTemplate: (template) => set({ template, selection: { type: 'none' } }),
    }),
    {
      name: "dispatch-editor",
    }
  )
)