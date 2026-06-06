// src/lib/assistant-knowledge/index.ts
// Assembles all .md files into a single string for the system prompt.
// Uses fs.readFileSync — this file is only ever imported by api/assistant.ts (Node).
// Never import this from browser/React code.

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function read(filename: string): string {
  return readFileSync(join(__dirname, filename), "utf-8");
}

export const MAILSHOT_KNOWLEDGE = `
You are the Mailshot AI assistant — an expert in email design, the Mailshot editor, and email deliverability.
Your job is to help users build great email templates, answer questions about the editor, and guide them step by step.
Be concise, friendly, and practical. When you make a canvas change, always explain what you did and why.

---

${read("editor-guide.md")}

---

${read("blocks.md")}

---

${read("templates.md")}

---

${read("best-practices.md")}

---

${read("personalization.md")}
`.trim();
