// src/store/assistant.ts
// Zustand store for the AI assistant chat panel.
// Owns: message history, loading state, error state, panel open/close.
// Does NOT call the API directly — that's useAssistant.ts's job.

import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { ChatEntry, AssistantAction, MessageStatus } from '@/types/assistant';

// ─── State shape ───────────────────────────────────────────────────────────────

interface AssistantState {
  // UI
  isOpen: boolean;

  // Chat
  entries: ChatEntry[];
  isLoading: boolean;
  error: string | null;

  // Actions
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;

  addUserMessage: (content: string) => string;           // returns entry id
  addAssistantPlaceholder: () => string;                 // returns entry id (for streaming)
  resolveAssistantMessage: (
    id: string,
    content: string,
    appliedActions?: AssistantAction[]
  ) => void;
  setEntryStatus: (id: string, status: MessageStatus) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  clearHistory: () => void;
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useAssistantStore = create<AssistantState>((set) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  isOpen: false,
  entries: [],
  isLoading: false,
  error: null,

  // ── Panel visibility ───────────────────────────────────────────────────────
  openPanel: () => set({ isOpen: true }),
  closePanel: () => set({ isOpen: false }),
  togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),

  // ── Message management ─────────────────────────────────────────────────────

  addUserMessage: (content) => {
    const id = nanoid();
    const entry: ChatEntry = {
      id,
      role: 'user',
      content,
      status: 'done',
      timestamp: Date.now(),
    };
    set((s) => ({ entries: [...s.entries, entry] }));
    return id;
  },

  // Called immediately when a request is sent — shows a "thinking" bubble
  addAssistantPlaceholder: () => {
    const id = nanoid();
    const entry: ChatEntry = {
      id,
      role: 'assistant',
      content: '',
      status: 'sending',
      timestamp: Date.now(),
    };
    set((s) => ({ entries: [...s.entries, entry] }));
    return id;
  },

  // Called when the API responds — fills in the placeholder
  resolveAssistantMessage: (id, content, appliedActions) => {
    set((s) => ({
      entries: s.entries.map((e) =>
        e.id === id
          ? { ...e, content, status: 'done', appliedActions }
          : e
      ),
    }));
  },

  setEntryStatus: (id, status) => {
    set((s) => ({
      entries: s.entries.map((e) => (e.id === id ? { ...e, status } : e)),
    }));
  },

  // ── Loading / error ────────────────────────────────────────────────────────
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // ── History ────────────────────────────────────────────────────────────────
  clearHistory: () => set({ entries: [], error: null }),
}));

// ─── Selectors ─────────────────────────────────────────────────────────────────
// Exported separately so components can subscribe to slices without re-rendering
// on unrelated state changes.

export const selectIsOpen = (s: AssistantState) => s.isOpen;
export const selectEntries = (s: AssistantState) => s.entries;
export const selectIsLoading = (s: AssistantState) => s.isLoading;
export const selectError = (s: AssistantState) => s.error;

// ─── History serializer ────────────────────────────────────────────────────────
// Converts ChatEntry[] → ChatMessage[] for the API payload.
// Strips UI-only fields (id, status, appliedActions, timestamp).

import type { ChatMessage } from '@/types/assistant';

export function entriesToHistory(entries: ChatEntry[]): ChatMessage[] {
  return entries
    .filter((e) => e.status === 'done' && e.content.trim())
    .map((e) => ({ role: e.role, content: e.content }));
}
