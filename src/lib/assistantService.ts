// src/lib/assistantService.ts
// Client-side wrapper around the /api/assistant endpoint.
// Everything here runs in the browser — never access Ollama directly from here.

import type {
  AssistantRequest,
  AssistantResponse,
  CanvasSnapshot,
  ChatMessage,
} from '@/types/assistant';

const ENDPOINT = '/api/assistant';

// ─── Canvas snapshot builder ───────────────────────────────────────────────────
// Extracts only what the API needs from the full Zustand editor state.
// Keep this lean — we don't want to send full block props over the wire.

export function buildCanvasSnapshot(editorState: {
  activePage: string;
  pages: Array<{
    canvases: Array<{
      sections: Array<{
        id: string;
        columns: Array<{
          id: string;
          blocks: Array<{ id: string; type: string }>;
        }>;
      }>;
    }>;
  }>;
}): CanvasSnapshot {
  // Use the first canvas of the active page as the snapshot target.
  // Adjust if you want to snapshot the currently selected canvas instead.
  const activePage = editorState.pages[0]; // TODO: use editorState.activePage index
  const activeCanvas = activePage?.canvases?.[0];

  return {
    activePage: editorState.activePage,
    sections: (activeCanvas?.sections ?? []).map((section) => ({
      id: section.id,
      columns: section.columns.map((col) => ({
        id: col.id,
        blocks: col.blocks.map((block) => ({
          id: block.id,
          type: block.type,
        })),
      })),
    })),
  };
}

// ─── Main send function ────────────────────────────────────────────────────────

export async function sendMessage(
  message: string,
  history: ChatMessage[],
  canvasState: CanvasSnapshot
): Promise<AssistantResponse> {
  const body: AssistantRequest = { message, history, canvasState };

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // Try to extract a meaningful error message from the response body
    let detail = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      detail = data.error ?? data.detail ?? detail;
    } catch {
      // Response wasn't JSON — use status text
      detail = res.statusText || detail;
    }
    throw new AssistantError(detail, res.status);
  }

  const data: AssistantResponse = await res.json();
  return data;
}

// ─── Custom error class ────────────────────────────────────────────────────────
// Lets callers distinguish assistant errors from general network errors.

export class AssistantError extends Error {
  readonly statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'AssistantError';
    this.statusCode = statusCode;
  }

  /** Returns true if the error is likely a model/server issue vs a network issue. */
  get isModelError(): boolean {
    return this.statusCode === 502 || this.statusCode === 500;
  }

  /** Returns true if the error is a client mistake (bad request). */
  get isClientError(): boolean {
    return this.statusCode !== undefined && this.statusCode >= 400 && this.statusCode < 500;
  }
}
