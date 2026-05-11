import { create } from "zustand";
import { persist } from "zustand/middleware";
import { temporal } from "zundo";
import { v4 as uuid } from "uuid";
import type { Block, Canvas, GlobalStyles, Section, Template } from "../types";

type SelectionState =
  | { type: "none" }
  | { type: "section"; sectionId: string }
  | { type: "block"; sectionId: string; columnId: string; blockId: string };

type EditorMode = "edit" | "preview";

type EditorStore = {
  template: Template;
  selection: SelectionState;
  mode: EditorMode;
  previewTemplate: Template | null;
  previewWidth: "desktop" | "mobile";
  currentProjectId: string | null;

  // Canvas actions
  addCanvas: () => void;
  renameCanvas: (canvasId: string, name: string) => void;
  removeCanvas: (canvasId: string) => void;
  setActiveCanvas: (canvasId: string) => void;
  duplicateCanvas: (canvasId: string) => void;

  // Mode
  setMode: (mode: EditorMode) => void;
  setPreviewTemplate: (template: Template | null) => void;
  setPreviewWidth: (width: "desktop" | "mobile") => void;
  setCurrentProjectId: (id: string | null) => void;

  // Section actions
  addSection: (columnCount: 1 | 2 | 3) => void;
  updateSection: (
    sectionId: string,
    changes: Partial<Omit<Section, "id" | "columns">>,
  ) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (activeId: string, overId: string) => void;

  // Block actions
  addBlock: (
    sectionId: string,
    columnId: string,
    block: Omit<Block, "id">,
  ) => void;
  updateBlock: (
    sectionId: string,
    columnId: string,
    blockId: string,
    changes: Partial<Block>,
  ) => void;
  removeBlock: (sectionId: string, columnId: string, blockId: string) => void;
  reorderBlocks: (
    sectionId: string,
    columnId: string,
    activeId: string,
    overId: string,
  ) => void;

  // Selection
  select: (selection: SelectionState) => void;

  // Global styles
  updateGlobalStyles: (changes: Partial<GlobalStyles>) => void;

  // Template
  setTemplate: (template: Template) => void;
  renameTemplate: (name: string) => void;
};

function makeColumn() {
  return { id: uuid(), blocks: [] };
}

function makeSection(columnCount: 1 | 2 | 3): Section {
  return {
    id: uuid(),
    columns: Array.from({ length: columnCount }, makeColumn),
    bgColor: "#ffffff",
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 24,
    paddingRight: 24,
  };
}

function makeCanvas(name = "Canvas 1"): Canvas {
  return {
    id: uuid(),
    name,
    sections: [],
    globalStyles: {
      fontFamily: "Inter, sans-serif",
      bgColor: "#f4f4f4",
      contentWidth: 600,
    },
  };
}

const initialCanvas = makeCanvas();

const defaultTemplate: Template = {
  id: uuid(),
  name: "Untitled",
  canvases: [initialCanvas],
  activeCanvasId: initialCanvas.id,
};

// Helper to get active canvas
const getActiveCanvas = (template: Template): Canvas => {
  return (
    template.canvases.find((c) => c.id === template.activeCanvasId) ??
    template.canvases[0]
  );
};

// Helper to update active canvas
const updateActiveCanvas = (
  template: Template,
  changes: Partial<Canvas>,
): Template => {
  return {
    ...template,
    canvases: template.canvases.map((c) =>
      c.id === template.activeCanvasId ? { ...c, ...changes } : c,
    ),
  };
};

export const useEditorStore = create<EditorStore>()(
  temporal(
    persist(
      (set) => ({
        template: defaultTemplate,
        selection: { type: "none" },
        mode: "edit",
        previewTemplate: null,
        previewWidth: "desktop",
        currentProjectId: null,

        addCanvas: () =>
          set((state) => {
            const count = state.template.canvases.length + 1;
            const newCanvas = makeCanvas(`Canvas ${count}`);
            return {
              template: {
                ...state.template,
                canvases: [...state.template.canvases, newCanvas],
                activeCanvasId: newCanvas.id,
              },
            };
          }),

        renameCanvas: (canvasId, name) =>
          set((state) => ({
            template: {
              ...state.template,
              canvases: state.template.canvases.map((c) =>
                c.id === canvasId ? { ...c, name } : c,
              ),
            },
          })),

        removeCanvas: (canvasId) =>
          set((state) => {
            if (state.template.canvases.length <= 1) return state;
            const remaining = state.template.canvases.filter(
              (c) => c.id !== canvasId,
            );
            const activeCanvasId =
              state.template.activeCanvasId === canvasId
                ? remaining[0].id
                : state.template.activeCanvasId;
            return {
              template: {
                ...state.template,
                canvases: remaining,
                activeCanvasId,
              },
            };
          }),

        setActiveCanvas: (canvasId) =>
          set((state) => ({
            template: { ...state.template, activeCanvasId: canvasId },
            selection: { type: "none" },
          })),

        duplicateCanvas: (canvasId) =>
          set((state) => {
            const canvas = state.template.canvases.find(
              (c) => c.id === canvasId,
            );
            if (!canvas) return state;
            const duplicate: Canvas = {
              ...canvas,
              id: uuid(),
              name: `${canvas.name} (copy)`,
              sections: canvas.sections.map((s) => ({
                ...s,
                id: uuid(),
                columns: s.columns.map((col) => ({
                  ...col,
                  id: uuid(),
                  blocks: col.blocks.map((b) => ({ ...b, id: uuid() })),
                })),
              })),
            };
            const index = state.template.canvases.findIndex(
              (c) => c.id === canvasId,
            );
            const canvases = [...state.template.canvases];
            canvases.splice(index + 1, 0, duplicate);
            return {
              template: {
                ...state.template,
                canvases,
                activeCanvasId: duplicate.id,
              },
            };
          }),

        setMode: (mode) => set({ mode }),
        setPreviewTemplate: (template) => set({ previewTemplate: template }),
        setPreviewWidth: (width) => set({ previewWidth: width }),
        setCurrentProjectId: (id) => set({ currentProjectId: id }),

        addSection: (columnCount) =>
          set((state) => {
            const active = getActiveCanvas(state.template);
            return {
              template: updateActiveCanvas(state.template, {
                sections: [...active.sections, makeSection(columnCount)],
              }),
            };
          }),

        updateSection: (sectionId, changes) =>
          set((state) => {
            const active = getActiveCanvas(state.template);
            return {
              template: updateActiveCanvas(state.template, {
                sections: active.sections.map((s) =>
                  s.id === sectionId ? { ...s, ...changes } : s,
                ),
              }),
            };
          }),

        removeSection: (sectionId) =>
          set((state) => {
            const active = getActiveCanvas(state.template);
            return {
              template: updateActiveCanvas(state.template, {
                sections: active.sections.filter((s) => s.id !== sectionId),
              }),
              selection: { type: "none" },
            };
          }),

        reorderSections: (activeId, overId) =>
          set((state) => {
            const active = getActiveCanvas(state.template);
            const sections = [...active.sections];
            const oldIndex = sections.findIndex((s) => s.id === activeId);
            const newIndex = sections.findIndex((s) => s.id === overId);
            if (oldIndex === -1 || newIndex === -1) return state;
            const [moved] = sections.splice(oldIndex, 1);
            sections.splice(newIndex, 0, moved);
            return {
              template: updateActiveCanvas(state.template, { sections }),
            };
          }),

        addBlock: (sectionId, columnId, block) =>
          set((state) => {
            const active = getActiveCanvas(state.template);
            return {
              template: updateActiveCanvas(state.template, {
                sections: active.sections.map((s) =>
                  s.id !== sectionId
                    ? s
                    : {
                        ...s,
                        columns: s.columns.map((c) =>
                          c.id !== columnId
                            ? c
                            : {
                                ...c,
                                blocks: [
                                  ...c.blocks,
                                  { ...block, id: uuid() } as Block,
                                ],
                              },
                        ),
                      },
                ),
              }),
            };
          }),

        updateBlock: (sectionId, columnId, blockId, changes) =>
          set((state) => {
            const active = getActiveCanvas(state.template);
            return {
              template: updateActiveCanvas(state.template, {
                sections: active.sections.map((s) =>
                  s.id !== sectionId
                    ? s
                    : {
                        ...s,
                        columns: s.columns.map((c) =>
                          c.id !== columnId
                            ? c
                            : {
                                ...c,
                                blocks: c.blocks.map((b) =>
                                  b.id === blockId
                                    ? ({ ...b, ...changes } as Block)
                                    : b,
                                ),
                              },
                        ),
                      },
                ),
              }),
            };
          }),

        removeBlock: (sectionId, columnId, blockId) =>
          set((state) => {
            const active = getActiveCanvas(state.template);
            return {
              template: updateActiveCanvas(state.template, {
                sections: active.sections.map((s) =>
                  s.id !== sectionId
                    ? s
                    : {
                        ...s,
                        columns: s.columns.map((c) =>
                          c.id !== columnId
                            ? c
                            : {
                                ...c,
                                blocks: c.blocks.filter(
                                  (b) => b.id !== blockId,
                                ),
                              },
                        ),
                      },
                ),
              }),
              selection: { type: "none" },
            };
          }),

        reorderBlocks: (sectionId, columnId, activeId, overId) =>
          set((state) => {
            const active = getActiveCanvas(state.template);
            return {
              template: updateActiveCanvas(state.template, {
                sections: active.sections.map((s) =>
                  s.id !== sectionId
                    ? s
                    : {
                        ...s,
                        columns: s.columns.map((c) => {
                          if (c.id !== columnId) return c;
                          const blocks = [...c.blocks];
                          const oldIndex = blocks.findIndex(
                            (b) => b.id === activeId,
                          );
                          const newIndex = blocks.findIndex(
                            (b) => b.id === overId,
                          );
                          if (oldIndex === -1 || newIndex === -1) return c;
                          const [moved] = blocks.splice(oldIndex, 1);
                          blocks.splice(newIndex, 0, moved);
                          return { ...c, blocks };
                        }),
                      },
                ),
              }),
            };
          }),

        select: (selection) => set({ selection }),

        updateGlobalStyles: (changes) =>
          set((state) => {
            const active = getActiveCanvas(state.template);
            return {
              template: updateActiveCanvas(state.template, {
                globalStyles: { ...active.globalStyles, ...changes },
              }),
            };
          }),

        setTemplate: (template) =>
          set({ template, selection: { type: "none" } }),

        renameTemplate: (name) =>
          set((state) => ({ template: { ...state.template, name } })),
      }),
      {
        name: "dispatch-editor",
        onRehydrateStorage: () => (state) => {
          if (!state) return;
          const t = state.template as any;
          if (!t.canvases) {
            const canvas = {
              id: crypto.randomUUID(),
              name: "Canvas 1",
              sections: t.sections ?? [],
              globalStyles: t.globalStyles ?? {
                fontFamily: "Inter, sans-serif",
                bgColor: "#f4f4f4",
                contentWidth: 600,
              },
            };
            state.template = {
              id: t.id,
              name: t.name,
              canvases: [canvas],
              activeCanvasId: canvas.id,
            };
          }
        },
      },
    ),
  ),
);

export const useEditorHistory = useEditorStore.temporal;

export { getActiveCanvas };
