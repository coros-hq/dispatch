// src/hooks/useAssistant.ts

import { useCallback } from "react";
import { useAssistantStore, entriesToHistory } from "@/store/assistant";
import { useEditorStore } from "@/store/editor";
import { sendMessage, AssistantError } from "@/lib/assistantService";
import { STARTER_TEMPLATES } from "@/lib/templates";
import type { AssistantAction } from "@/types/assistant";

// ─── Prop normalizer ───────────────────────────────────────────────────────────

const PROP_ALIASES: Record<string, string> = {
  backgroundColor: "bgColor",
  background_color: "bgColor",
  buttonBackground: "buttonBgColor",
  headline: "title", // model uses headline, renderer uses title
};
const KEEPS_BACKGROUND_COLOR = new Set(["hero"]);

function normalizeProps(
  blockType: string,
  props: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    const alias = PROP_ALIASES[key];
    result[alias && !KEEPS_BACKGROUND_COLOR.has(blockType) ? alias : key] =
      value;
  }
  return result;
}

// ─── Block defaults ────────────────────────────────────────────────────────────
// Prevents renderer crashes when the model omits required string props.

const BLOCK_DEFAULTS: Record<string, Record<string, unknown>> = {
  hero: {
    title: "",
    subtitle: "",
    buttonLabel: "",
    buttonHref: "#",
    textColor: "#ffffff",
    backgroundColor: "#1a2340",
    overlayColor: "rgba(0,0,0,0)",
    align: "center",
    minHeight: 300,
  },
  button: {
    label: "Button",
    href: "#",
    bgColor: "#000000",
    textColor: "#ffffff",
    borderRadius: 4,
    align: "center",
  },
  text: {
    content: "",
    fontSize: 16,
    color: "#111111",
    align: "left",
    fontWeight: "normal",
  },
  image: {
    src: "https://placehold.co/600x300",
    alt: "",
    width: 600,
  },
  divider: {
    color: "#eeeeee",
    thickness: 1,
  },
  spacer: {
    height: 24,
  },
  social: {
    links: [],
    align: "center",
    iconSize: 20,
    iconColor: "#666666",
  },
  unsubscribe: {
    companyName: "",
    address: "",
    unsubscribeUrl: "#",
    textColor: "#aaaaaa",
    fontSize: 11,
  },
  coupon: {
    code: "",
    description: "",
    bgColor: "#fff8f0",
    borderColor: "#f59e0b",
    borderStyle: "dashed",
    textColor: "#111111",
  },
  quote: {
    text: "",
    author: "",
    role: "",
    bgColor: "#f9f9f9",
    textColor: "#111111",
    borderColor: "#111111",
  },
  countdown: {
    targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    bgColor: "#111111",
    textColor: "#ffffff",
    showLabels: true,
  },
  navigation: {
    links: [],
    bgColor: "#ffffff",
    textColor: "#111111",
    fontSize: 14,
    align: "center",
  },
};

function applyBlockDefaults(
  block: Record<string, unknown>,
): Record<string, unknown> {
  const defaults = BLOCK_DEFAULTS[block.type as string] ?? {};
  return { ...defaults, ...block }; // model props override defaults
}

function prepareBlock(
  blockType: string,
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const normalized = normalizeProps(blockType, raw);
  return applyBlockDefaults(normalized);
}

// ─── Block summarizer ──────────────────────────────────────────────────────────

function summarizeBlock(block: any): Record<string, unknown> {
  switch (block.type) {
    case "text":
      return {
        content: String(block.content ?? "")
          .replace(/<[^>]+>/g, "")
          .slice(0, 60),
      };
    case "button":
      return {
        label: block.label,
        bgColor: block.bgColor,
        textColor: block.textColor,
      };
    case "image":
      return { alt: block.alt, src: String(block.src ?? "").slice(0, 50) };
    case "hero":
      return { title: block.title, backgroundColor: block.backgroundColor };
    case "spacer":
      return { height: block.height };
    case "unsubscribe":
      return { companyName: block.companyName };
    case "coupon":
      return { code: block.code };
    default:
      return {};
  }
}

// ─── columnId resolver ─────────────────────────────────────────────────────────

function resolveColumnId(
  sectionId: string,
  action: { columnId?: string; columnIndex?: number },
): string | undefined {
  if (action.columnId) return action.columnId;
  const { template } = useEditorStore.getState();
  const activePage =
    template.pages.find((p) => p.id === template.activePageId) ??
    template.pages[0];
  const activeCanvas =
    activePage?.canvases.find((c) => c.id === activePage.activeCanvasId) ??
    activePage?.canvases[0];
  const section = activeCanvas?.sections.find((s) => s.id === sectionId);
  return section?.columns[action.columnIndex ?? 0]?.id;
}

// ─── block location resolver ───────────────────────────────────────────────────

function resolveBlockLocation(action: {
  sectionId?: string;
  columnId?: string;
  columnIndex?: number;
  blockId: string;
}): { sectionId: string; columnId: string } | null {
  const { template } = useEditorStore.getState();
  const activePage =
    template.pages.find((p) => p.id === template.activePageId) ??
    template.pages[0];
  const activeCanvas =
    activePage?.canvases.find((c) => c.id === activePage.activeCanvasId) ??
    activePage?.canvases[0];
  if (!activeCanvas) return null;

  for (const section of activeCanvas.sections) {
    for (const col of section.columns) {
      if (col.blocks.some((b) => b.id === action.blockId)) {
        return { sectionId: section.id, columnId: col.id };
      }
    }
  }

  if (action.sectionId) {
    const columnId = resolveColumnId(action.sectionId, action);
    if (columnId) return { sectionId: action.sectionId, columnId };
  }

  return null;
}

// ─── block type lookup ─────────────────────────────────────────────────────────

function getBlockType(blockId: string): string {
  const { template } = useEditorStore.getState();
  const activePage =
    template.pages.find((p) => p.id === template.activePageId) ??
    template.pages[0];
  const activeCanvas =
    activePage?.canvases.find((c) => c.id === activePage.activeCanvasId) ??
    activePage?.canvases[0];
  return (
    activeCanvas?.sections
      .flatMap((s) => s.columns.flatMap((c) => c.blocks))
      .find((b) => b.id === blockId)?.type ?? ""
  );
}

// ─── Action dispatcher ─────────────────────────────────────────────────────────

function useActionDispatcher() {
  const addBlock = useEditorStore((s) => s.addBlock);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const removeBlock = useEditorStore((s) => s.removeBlock);
  const addSection = useEditorStore((s) => s.addSection);
  const removeSection = useEditorStore((s) => s.removeSection);
  const reorderSections = useEditorStore((s) => s.reorderSections);
  const setTemplate = useEditorStore((s) => s.setTemplate);

  return useCallback(
    (actions: AssistantAction[]) => {
      for (const rawAction of actions) {
        const action = rawAction as any;
        console.log("[dispatcher] action:", action);

        switch (action.type) {
          case "add_block": {
            const columnId = resolveColumnId(action.sectionId, action);
            if (!columnId) {
              // sectionId doesn't exist in canvas — model invented a placeholder ID.
              // Fall back to creating a new section so the block isn't lost.
              console.warn("[dispatcher] add_block: sectionId not found, falling back to new section", action.sectionId);
              addSection(action.columnCount ?? 1);
              const { template: t2 } = useEditorStore.getState();
              const ap2 = t2.pages.find((p) => p.id === t2.activePageId) ?? t2.pages[0];
              const ac2 = ap2?.canvases.find((c) => c.id === ap2.activeCanvasId) ?? ap2?.canvases[0];
              const ns2 = ac2?.sections[ac2.sections.length - 1];
              if (ns2) {
                const block = prepareBlock(action.block?.type ?? "", action.block ?? {});
                addBlock(ns2.id, ns2.columns[0].id, block as any);
              }
              break;
            }
            const block = prepareBlock(
              action.block?.type ?? "",
              action.block ?? {},
            );
            addBlock(action.sectionId, columnId, block as any);
            break;
          }

          case "update_block": {
            const rawChanges = action.changes ?? action.props ?? {};
            const loc = resolveBlockLocation(action);
            if (!loc) {
              console.warn(
                "[dispatcher] update_block: block not found",
                action,
              );
              break;
            }
            const blockType = getBlockType(action.blockId);
            const changes = normalizeProps(blockType, rawChanges);
            updateBlock(
              loc.sectionId,
              loc.columnId,
              action.blockId,
              changes as any,
            );
            break;
          }

          case "remove_block": {
            const loc = resolveBlockLocation(action);
            if (!loc) {
              console.warn(
                "[dispatcher] remove_block: block not found",
                action,
              );
              break;
            }
            removeBlock(loc.sectionId, loc.columnId, action.blockId);
            break;
          }

          case "add_section":
            addSection(action.columnCount ?? 1);
            break;

          case "add_section_with_block": {
            addSection(action.columnCount ?? 1);
            const { template } = useEditorStore.getState();
            const activePage =
              template.pages.find((p) => p.id === template.activePageId) ??
              template.pages[0];
            const activeCanvas =
              activePage?.canvases.find(
                (c) => c.id === activePage.activeCanvasId,
              ) ?? activePage?.canvases[0];
            const newSection =
              activeCanvas?.sections[activeCanvas.sections.length - 1];
            if (newSection) {
              const block = prepareBlock(
                action.block?.type ?? "",
                action.block ?? {},
              );
              addBlock(newSection.id, newSection.columns[0].id, block as any);
            }
            break;
          }

          case "remove_section":
            removeSection(action.sectionId);
            break;

          case "reorder_sections":
            reorderSections(action.activeId, action.overId);
            break;

          case "load_template": {
            const found = STARTER_TEMPLATES.find(
              (t) => t.id === action.templateId,
            );
            if (found) {
              setTemplate(found);
            } else {
              console.warn(
                "[dispatcher] unknown templateId:",
                action.templateId,
              );
            }
            break;
          }

          default:
            console.warn("[dispatcher] unhandled action type:", action?.type);
        }
      }
    },
    [
      addBlock,
      updateBlock,
      removeBlock,
      addSection,
      removeSection,
      reorderSections,
      setTemplate,
    ],
  );
}

// ─── Canvas snapshot ───────────────────────────────────────────────────────────

function useCanvasSnapshot() {
  const template = useEditorStore((s) => s.template);

  return useCallback(() => {
    const activePage =
      template.pages.find((p) => p.id === template.activePageId) ??
      template.pages[0];
    const activeCanvas =
      activePage?.canvases.find((c) => c.id === activePage.activeCanvasId) ??
      activePage?.canvases[0];

    return {
      activePage: activePage?.name ?? "",
      sections: (activeCanvas?.sections ?? []).map((section) => ({
        id: section.id,
        columns: section.columns.map((col) => ({
          id: col.id,
          blocks: col.blocks.map((block) => ({
            id: block.id,
            type: block.type,
            ...summarizeBlock(block),
          })),
        })),
      })),
    };
  }, [template]);
}

// ─── Main hook ─────────────────────────────────────────────────────────────────

export function useAssistant() {
  const store = useAssistantStore();
  const dispatchActions = useActionDispatcher();
  const getSnapshot = useCanvasSnapshot();

  const send = useCallback(
    async (message: string) => {
      if (!message.trim() || store.isLoading) return;

      store.addUserMessage(message);
      const placeholderId = store.addAssistantPlaceholder();
      store.setLoading(true);
      store.clearError();

      try {
        const canvasState = getSnapshot();
        const history = entriesToHistory(store.entries);
        const response = await sendMessage(message, history, canvasState);

        console.log("[assistant] response actions:", response.actions);

        if (response.actions.length > 0) {
          dispatchActions(response.actions);
        }

        store.resolveAssistantMessage(
          placeholderId,
          response.reply,
          response.actions,
        );
      } catch (err) {
        const errorMessage =
          err instanceof AssistantError
            ? err.message
            : "Something went wrong. Is Ollama running?";
        store.setError(errorMessage);
        store.resolveAssistantMessage(placeholderId, `⚠️ ${errorMessage}`);
        store.setEntryStatus(placeholderId, "error");
      } finally {
        store.setLoading(false);
      }
    },
    [store, dispatchActions, getSnapshot],
  );

  return {
    entries: store.entries,
    isLoading: store.isLoading,
    error: store.error,
    isOpen: store.isOpen,
    send,
    openPanel: store.openPanel,
    closePanel: store.closePanel,
    togglePanel: store.togglePanel,
    clearHistory: store.clearHistory,
    clearError: store.clearError,
  };
}
