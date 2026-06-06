// src/types/assistant.ts
// Shared types for the AI assistant feature.
// Used by: api/assistant.ts, assistantService.ts, store/assistant.ts, hooks/useAssistant.ts

// ─── Wire types ────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/** Compact snapshot of the canvas — sent with every request to give the model context. */
export interface CanvasSnapshot {
  activePage: string;
  sections: Array<{
    id: string;
    columns: Array<{
      id: string; // columnId is required — the editor uses it, not an index
      blocks: Array<{ type: string; id: string }>;
    }>;
  }>;
}

export interface AssistantRequest {
  message: string;
  history: ChatMessage[];
  canvasState: CanvasSnapshot;
}

export interface AssistantResponse {
  reply: string;
  actions: AssistantAction[];
}

// ─── Actions ──────────────────────────────────────────────────────────────────
// Each action maps directly to an editor store method.
// Signatures match useEditorStore exactly.

export type AssistantActionType =
  | "add_block"
  | "update_block"
  | "remove_block"
  | "add_section"
  | "remove_section"
  | "reorder_sections"
  | "load_template";

interface BaseAction {
  type: AssistantActionType;
}

/** Maps to: editor.addBlock(sectionId, columnId, block) */
export interface AddBlockAction extends BaseAction {
  type: "add_block";
  sectionId: string;
  columnId: string; // actual column id, not an index
  block: Record<string, unknown> & { type: string };
}

/** Maps to: editor.updateBlock(sectionId, columnId, blockId, changes) */
export interface UpdateBlockAction extends BaseAction {
  type: "update_block";
  sectionId: string;
  columnId: string;
  blockId: string;
  changes: Record<string, unknown>;
}

/** Maps to: editor.removeBlock(sectionId, columnId, blockId) */
export interface RemoveBlockAction extends BaseAction {
  type: "remove_block";
  sectionId: string;
  columnId: string;
  blockId: string;
}

/** Maps to: editor.addSection(columnCount) */
export interface AddSectionAction extends BaseAction {
  type: "add_section";
  columnCount: 1 | 2 | 3;
}

/** Maps to: editor.removeSection(sectionId) */
export interface RemoveSectionAction extends BaseAction {
  type: "remove_section";
  sectionId: string;
}

/** Maps to: editor.reorderSections(activeId, overId) */
export interface ReorderSectionsAction extends BaseAction {
  type: "reorder_sections";
  activeId: string; // section being moved
  overId: string; // section it's dropped onto
}

/**
 * Maps to: editor.setTemplate(template)
 * The model passes a templateId string; the hook resolves it to a full Template
 * using the seeded templates list — the model never constructs a full Template object.
 */
export interface LoadTemplateAction extends BaseAction {
  type: "load_template";
  templateId: string;
}

// Discriminated union — switch(action.type) is fully type-safe
export type AssistantAction =
  | AddBlockAction
  | UpdateBlockAction
  | RemoveBlockAction
  | AddSectionAction
  | RemoveSectionAction
  | ReorderSectionsAction
  | LoadTemplateAction
  | AddSectionWithBlockAction;

// ─── Chat UI types ─────────────────────────────────────────────────────────────

export type MessageStatus = "sending" | "done" | "error";

export interface ChatEntry {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: MessageStatus;
  appliedActions?: AssistantAction[];
  timestamp: number;
}

/** Atomic action: creates a new section and immediately adds a block to its first column.
 *  Use this whenever you need to add a block to a NEW section.
 *  The section id is unknown until runtime — this solves that by doing both steps atomically.
 */
export interface AddSectionWithBlockAction {
  type: "add_section_with_block";
  columnCount?: 1 | 2 | 3;
  block: Record<string, unknown> & { type: string };
}
