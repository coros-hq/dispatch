import { create } from "zustand";
import { persist } from "zustand/middleware";
import { temporal } from "zundo";
import { v4 as uuid } from "uuid";
import type {
  Block,
  Canvas,
  GlobalStyles,
  Page,
  Section,
  Template,
} from "../types";
import { GOOGLE_FONT_PRESETS } from "../lib/google-fonts";
import { migrateTemplate } from "../lib/template-service";

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
  readOnly: boolean;
  canvasCounter: number;
  pageCounter: number;

  // Page actions
  addPage: () => void;
  removePage: (pageId: string) => void;
  renamePage: (pageId: string, name: string) => void;
  setActivePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => void;

  // Canvas actions (active page only)
  updateCanvasPosition: (canvasId: string, x: number, y: number) => void;
  replaceActiveCanvas: (canvas: Omit<Canvas, "id" | "name">) => void;
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
  setReadOnly: (readOnly: boolean) => void;

  // Section actions
  addSection: (columnCount: 1 | 2 | 3) => void;
  updateSection: (
    sectionId: string,
    changes: Partial<Omit<Section, "id">>,
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
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
  };
}

const defaultInter = GOOGLE_FONT_PRESETS.find((p) => p.id === "inter")!;

function makeCanvas(name = "Variant 1", x = 0, y = 0): Canvas {
  return {
    id: uuid(),
    name,
    x,
    y,
    sections: [],
    globalStyles: {
      fontFamily: defaultInter.fontFamily,
      googleFontCssImportUrl: defaultInter.importUrl,
      bgColor: "#f4f4f4",
      contentWidth: 600,
    },
  };
}

function makeEmptyPage(name: string): Page {
  const canvas = makeCanvas("Variant 1", 0, 0);
  return {
    id: uuid(),
    name,
    canvases: [canvas],
    activeCanvasId: canvas.id,
  };
}

const initialCanvas = makeCanvas();
const initialPageId = uuid();

const defaultTemplate: Template = {
  id: uuid(),
  name: "Untitled",
  pages: [
    {
      id: initialPageId,
      name: "Page 1",
      canvases: [initialCanvas],
      activeCanvasId: initialCanvas.id,
    },
  ],
  activePageId: initialPageId,
};

export function getActivePage(template: Template): Page {
  const p = template.pages.find((x) => x.id === template.activePageId);
  return p ?? template.pages[0];
}

export function getActiveCanvas(template: Template): Canvas {
  const page = getActivePage(template);
  return (
    page.canvases.find((c) => c.id === page.activeCanvasId) ??
    page.canvases[0]
  );
}

function updateActiveCanvasInTemplate(
  template: Template,
  changes: Partial<Canvas>,
): Template {
  const pid = template.activePageId;
  const page = getActivePage(template);
  const cid = page.activeCanvasId;
  return {
    ...template,
    pages: template.pages.map((p) =>
      p.id !== pid
        ? p
        : {
            ...p,
            canvases: p.canvases.map((c) =>
              c.id === cid ? { ...c, ...changes } : c,
            ),
          },
    ),
  };
}

function maxCanvasesAcrossPages(template: Template): number {
  return template.pages.reduce(
    (m, p) => Math.max(m, p.canvases.length),
    0,
  );
}

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
        readOnly: false,
        canvasCounter: 1,
        pageCounter: 1,

        setReadOnly: (readOnly) => set({ readOnly }),

        addPage: () =>
          set((state) => {
            const n = state.template.pages.length + 1;
            const newPage = makeEmptyPage(`Page ${n}`);
            return {
              template: {
                ...state.template,
                pages: [...state.template.pages, newPage],
                activePageId: newPage.id,
              },
              pageCounter: Math.max(state.pageCounter, n),
              selection: { type: "none" },
            };
          }),

        removePage: (pageId) =>
          set((state) => {
            if (state.template.pages.length <= 1) return state;
            const remaining = state.template.pages.filter(
              (p) => p.id !== pageId,
            );
            const activePageId =
              state.template.activePageId === pageId
                ? remaining[0].id
                : state.template.activePageId;
            return {
              template: {
                ...state.template,
                pages: remaining,
                activePageId,
              },
              selection: { type: "none" },
            };
          }),

        renamePage: (pageId, name) =>
          set((state) => ({
            template: {
              ...state.template,
              pages: state.template.pages.map((p) =>
                p.id === pageId ? { ...p, name } : p,
              ),
            },
          })),

        setActivePage: (pageId) =>
          set((state) => ({
            template: { ...state.template, activePageId: pageId },
            selection: { type: "none" },
          })),

        duplicatePage: (pageId) =>
          set((state) => {
            const page = state.template.pages.find((p) => p.id === pageId);
            if (!page) return state;
            const acIdx = Math.max(
              0,
              page.canvases.findIndex((c) => c.id === page.activeCanvasId),
            );
            const newPage: Page = {
              id: uuid(),
              name: `${page.name} (copy)`,
              canvases: page.canvases.map((c) => ({
                ...c,
                id: uuid(),
                sections: c.sections.map((s) => ({
                  ...s,
                  id: uuid(),
                  columns: s.columns.map((col) => ({
                    ...col,
                    id: uuid(),
                    blocks: col.blocks.map(
                      (b) => ({ ...b, id: uuid() }) as Block,
                    ),
                  })),
                })),
              })),
              activeCanvasId: "",
            };
            const dupIdx = Math.min(acIdx, newPage.canvases.length - 1);
            newPage.activeCanvasId = newPage.canvases[dupIdx]!.id;
            const index = state.template.pages.findIndex(
              (p) => p.id === pageId,
            );
            const pages = [...state.template.pages];
            pages.splice(index + 1, 0, newPage);
            return {
              template: {
                ...state.template,
                pages,
                activePageId: newPage.id,
              },
              selection: { type: "none" },
            };
          }),

        updateCanvasPosition: (canvasId, x, y) =>
          set((state) => ({
            template: {
              ...state.template,
              pages: state.template.pages.map((p) => ({
                ...p,
                canvases: p.canvases.map((c) =>
                  c.id === canvasId ? { ...c, x, y } : c,
                ),
              })),
            },
          })),

        replaceActiveCanvas: (canvas) =>
          set((state) => ({
            template: updateActiveCanvasInTemplate(state.template, {
              sections: canvas.sections,
              globalStyles: canvas.globalStyles,
            }),
            selection: { type: "none" },
          })),

        addCanvas: () =>
          set((state) => {
            const page = getActivePage(state.template);
            const canvases = page.canvases;
            const nextN = canvases.length + 1;
            const totalWidth = canvases.reduce((acc, c) => {
              return acc + (c.globalStyles?.contentWidth ?? 600) + 80;
            }, 0);
            const newCanvas = makeCanvas(`Variant ${nextN}`, totalWidth, 0);
            return {
              template: {
                ...state.template,
                pages: state.template.pages.map((p) =>
                  p.id !== page.id
                    ? p
                    : {
                        ...p,
                        canvases: [...p.canvases, newCanvas],
                        activeCanvasId: newCanvas.id,
                      },
                ),
              },
              canvasCounter: Math.max(state.canvasCounter, nextN),
            };
          }),

        renameCanvas: (canvasId, name) =>
          set((state) => ({
            template: {
              ...state.template,
              pages: state.template.pages.map((p) => ({
                ...p,
                canvases: p.canvases.map((c) =>
                  c.id === canvasId ? { ...c, name } : c,
                ),
              })),
            },
          })),

        removeCanvas: (canvasId) =>
          set((state) => {
            const page = getActivePage(state.template);
            if (page.canvases.length <= 1) return state;
            const remaining = page.canvases.filter((c) => c.id !== canvasId);
            const activeCanvasId =
              page.activeCanvasId === canvasId
                ? remaining[0].id
                : page.activeCanvasId;
            return {
              template: {
                ...state.template,
                pages: state.template.pages.map((p) =>
                  p.id !== page.id
                    ? p
                    : { ...p, canvases: remaining, activeCanvasId },
                ),
              },
            };
          }),

        setActiveCanvas: (canvasId) =>
          set((state) => ({
            template: {
              ...state.template,
              pages: state.template.pages.map((p) =>
                p.id !== state.template.activePageId
                  ? p
                  : { ...p, activeCanvasId: canvasId },
              ),
            },
            selection: { type: "none" },
          })),

        duplicateCanvas: (canvasId) =>
          set((state) => {
            const page = getActivePage(state.template);
            const canvas = page.canvases.find((c) => c.id === canvasId);
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
                  blocks: col.blocks.map((b) => ({ ...b, id: uuid() }) as Block),
                })),
              })),
            };
            const index = page.canvases.findIndex((c) => c.id === canvasId);
            const canvases = [...page.canvases];
            canvases.splice(index + 1, 0, duplicate);
            return {
              template: {
                ...state.template,
                pages: state.template.pages.map((p) =>
                  p.id !== page.id
                    ? p
                    : { ...p, canvases, activeCanvasId: duplicate.id },
                ),
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
              template: updateActiveCanvasInTemplate(state.template, {
                sections: [...active.sections, makeSection(columnCount)],
              }),
            };
          }),

        updateSection: (sectionId, changes) =>
          set((state) => {
            const active = getActiveCanvas(state.template);
            return {
              template: updateActiveCanvasInTemplate(state.template, {
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
              template: updateActiveCanvasInTemplate(state.template, {
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
              template: updateActiveCanvasInTemplate(state.template, {
                sections,
              }),
            };
          }),

        addBlock: (sectionId, columnId, block) =>
          set((state) => {
            const active = getActiveCanvas(state.template);
            return {
              template: updateActiveCanvasInTemplate(state.template, {
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
              template: updateActiveCanvasInTemplate(state.template, {
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
              template: updateActiveCanvasInTemplate(state.template, {
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
              template: updateActiveCanvasInTemplate(state.template, {
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
              template: updateActiveCanvasInTemplate(state.template, {
                globalStyles: { ...active.globalStyles, ...changes },
              }),
            };
          }),

        setTemplate: (template) =>
          set((state) => {
            const migrated = migrateTemplate(template as any);
            return {
              template: migrated,
              selection: { type: "none" },
              canvasCounter: Math.max(
                state.canvasCounter,
                maxCanvasesAcrossPages(migrated),
              ),
              pageCounter: Math.max(
                state.pageCounter,
                migrated.pages.length,
              ),
            };
          }),

        renameTemplate: (name) =>
          set((state) => ({ template: { ...state.template, name } })),
      }),
      {
        name: "dispatch-editor",
        onRehydrateStorage: () => (state) => {
          if (!state?.template) return;
          state.template = migrateTemplate(state.template as any);
          state.template.pages = state.template.pages.map((p) => ({
            ...p,
            canvases: p.canvases.map((c: Canvas) => {
              const gs = { ...c.globalStyles };
              if (!gs.googleFontCssImportUrl) {
                const byStack = GOOGLE_FONT_PRESETS.find(
                  (x) => x.fontFamily === gs.fontFamily,
                );
                if (byStack) {
                  gs.googleFontCssImportUrl = byStack.importUrl;
                } else if (
                  /^inter\b/i.test(gs.fontFamily) &&
                  gs.fontFamily.toLowerCase().includes("sans-serif")
                ) {
                  gs.fontFamily = defaultInter.fontFamily;
                  gs.googleFontCssImportUrl = defaultInter.importUrl;
                }
              }
              return { ...c, globalStyles: gs };
            }),
          }));
        },
      },
    ),
  ),
);

export const useEditorHistory = useEditorStore.temporal;
