// api/assistant.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MAILSHOT_KNOWLEDGE } from "../src/lib/assistant-knowledge/index";
import type {
  AssistantAction,
  AssistantResponse,
  ChatMessage,
  CanvasSnapshot,
  AssistantRequest,
} from "../src/types/assistant.js";

function parseActions(raw: string): {
  reply: string;
  actions: AssistantAction[];
} {
  const actions: AssistantAction[] = [];
  const re = () => /```(?:action|json)\s*([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  const regex = re();
  while ((match = regex.exec(raw)) !== null) {
    const fenceContent = match[1].trim();
    // First try the whole block as a single JSON value (object or array)
    try {
      const parsed = JSON.parse(fenceContent);
      if (Array.isArray(parsed)) actions.push(...parsed);
      else actions.push(parsed as AssistantAction);
      continue;
    } catch {
      // Not a single JSON value — fall through to line-by-line parsing
    }
    // Model sometimes emits multiple JSON objects separated by newlines in one fence.
    // Parse each non-empty line individually.
    let parsedAny = false;
    for (const line of fenceContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) actions.push(...parsed);
        else actions.push(parsed as AssistantAction);
        parsedAny = true;
      } catch {
        // Skip unparseable lines silently
      }
    }
    if (!parsedAny) {
      console.warn(
        "[assistant] Skipping unparseable action fence:",
        fenceContent.slice(0, 120),
      );
    }
  }
  const reply = raw
    .replace(re(), "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { reply, actions };
}

function serializeCanvas(canvas: CanvasSnapshot): string {
  if (!canvas?.sections?.length) return "Canvas is empty.";
  const lines = [`Active page: ${canvas.activePage}`, "Current sections:"];
  canvas.sections.forEach((section, i) => {
    lines.push(`  [${i}] sectionId:${section.id}`);
    section.columns.forEach((col, ci) => {
      const blockSummary = col.blocks
        .map((b) => {
          const extras = Object.entries(b)
            .filter(([k]) => !["id", "type"].includes(k))
            .map(([k, v]) => `${k}:${JSON.stringify(v)}`)
            .join(" ");
          return `${b.type}(id:${b.id}${extras ? " " + extras : ""})`;
        })
        .join(", ");
      lines.push(
        `    col[${ci}] columnId:${col.id} → ${blockSummary || "empty"}`,
      );
    });
  });
  return lines.join("\n");
}

function buildSystemPrompt(canvas: CanvasSnapshot): string {
  return `${MAILSHOT_KNOWLEDGE}

---

## Current canvas state
${serializeCanvas(canvas)}

---

## Output format — STRICT RULES

You are a JSON action emitter. Your ONLY job is to emit action objects and a short confirmation.

RULE 1 — ONE ACTION PER LINE, ONE FENCE TOTAL.
Wrap ALL actions for a response in a SINGLE \`\`\`action fence.
Put each JSON object on its own line. Do NOT use arrays. Do NOT nest fences.

\`\`\`action
{ "type": "add_section_with_block", "columnCount": 1, "block": { "type": "hero", "title": "Summer Sale", "backgroundColor": "#1a2340", "textColor": "#ffffff" } }
{ "type": "add_section_with_block", "columnCount": 1, "block": { "type": "button", "label": "Shop Now", "bgColor": "#000000", "textColor": "#ffffff", "borderRadius": 4, "href": "#" } }
\`\`\`

RULE 2 — ADDING NEW BLOCKS: always use add_section_with_block, one per block. NEVER use add_block for a block that doesn't already exist in the canvas.
RULE 3 — add_block is ONLY for adding to a section that already exists in the canvas state. If a sectionId isn't in the canvas state above, don't use add_block.
RULE 4 — When building a multi-block email (hero + text + button + divider + unsubscribe), emit one add_section_with_block per block. Each block gets its own section.
RULE 5 — Only use sectionId / columnId / blockId values that appear in the canvas state above. Never invent IDs like SECTION_0, SECTION_1, COLUMN_0, or REAL_ID.
RULE 5 — Fence language must be exactly "action". Never use "json", "plaintext", or any other language.
RULE 6 — No step-by-step explanations. No "Step 1 / Step 2" prose. No markdown headers. No bullet lists.
RULE 7 — After the fence, write ONE sentence confirming what was done. Nothing else.
RULE 8 — If the request is vague (e.g. "go ahead", "ok", "yes", "continue"), ask ONE clarifying question. Do NOT guess or add blocks.
RULE 9 — Never load a template unless the user explicitly says "load", "use", or "apply" a template.
RULE 10 — Always include all required props for each block type so nothing renders blank.

Action reference:
| type                   | required fields                                                     |
|------------------------|---------------------------------------------------------------------|
| add_section_with_block | columnCount (1/2/3), block: { type, ...props }                      |
| add_block              | sectionId, columnId, block: { type, ...props }                      |
| update_block           | blockId, changes: { ...props }                                      |
| remove_block           | blockId                                                             |
| remove_section         | sectionId                                                           |
| reorder_sections       | activeId, overId                                                    |
| load_template          | templateId                                                          |

Block prop requirements (always include these — never leave them undefined):
- hero: backgroundColor, textColor, title, subtitle, buttonLabel, buttonHref, buttonBgColor, buttonTextColor, minHeight, align, overlayColor
- button: label, href, bgColor, textColor, borderRadius, align
- text: content, fontSize, color, align, fontWeight
- image: src, alt, width
- image-grid: columns, gap, borderRadius, images (array of {src, alt})
- unsubscribe: companyName, address, unsubscribeUrl, fontSize, textColor
- divider: color, thickness`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { message, history = [], canvasState } = req.body as AssistantRequest;
  if (!message?.trim())
    return res.status(400).json({ error: "message is required" });

  const ollamaUrl = process.env.OLLAMA_URL ?? "http://localhost:11434";
  const ollamaModel = process.env.OLLAMA_MODEL ?? "qwen2.5:7b";
  const ollamaSecret = process.env.OLLAMA_SECRET;

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: buildSystemPrompt(
        canvasState ?? { activePage: "", sections: [] },
      ),
    },
    ...history.slice(-10),
    { role: "user", content: message },
  ];

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (ollamaSecret) headers["X-Assistant-Secret"] = ollamaSecret;

    const ollamaRes = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: ollamaModel,
        stream: false,
        options: { temperature: 0.3, top_p: 0.9, num_predict: 1024 },
        messages,
      }),
    });

    if (!ollamaRes.ok) {
      const detail = await ollamaRes.text();
      console.error("[assistant] Ollama error:", detail);
      return res.status(502).json({ error: "Model unavailable", detail });
    }

    const data = (await ollamaRes.json()) as { message?: { content?: string } };
    const rawContent: string = data?.message?.content ?? "";
    console.log("[assistant] raw response:", rawContent);

    if (!rawContent)
      return res.status(502).json({ error: "Empty response from model" });

    const { reply, actions } = parseActions(rawContent);
    return res.status(200).json({ reply, actions } as AssistantResponse);
  } catch (err) {
    console.error("[assistant] Fetch failed:", err);
    return res.status(500).json({
      error: "Failed to reach Ollama. Is it running?",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
