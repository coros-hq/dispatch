# Mailshot Editor Guide

## Data hierarchy
Template (project)
  └── Pages (e.g. Page 1, Page 2)
        └── Canvases (A/B variants of a page — positioned on an infinite canvas)
              └── Sections (horizontal rows, reorderable)
                    └── Columns (1, 2, or 3 per section)
                          └── Blocks (content — text, image, button, etc.)

## Key concepts

### Infinite canvas
The editor uses a pan/zoom infinite canvas (like Figma). Use Alt+drag to pan, scroll to zoom.
Each canvas frame on the canvas represents one email variant (A/B testing).

### Pages
A project can have multiple pages. Each page renders as a separate email when sending.
Free plan: max 2 pages. Pro: unlimited.

### Canvases (A/B variants)
Each page can have multiple canvases — these are A/B variants of the same email.
You can send different variants to different segments of your list.

### Sections
Sections are horizontal rows that stack vertically to form the email.
Drag sections to reorder. Each section can have 1, 2, or 3 columns.

### Columns
Columns sit inside sections. Each column holds one or more blocks.
Drop blocks into columns from the left panel.

### Blocks
The actual content. See blocks.md for all 15+ types.

## Toolbar actions
- Save: Cmd+S or the Save button
- Undo/Redo: Cmd+Z / Cmd+Shift+Z
- Preview: Opens a merged email preview
- Send test: Sends to a test email address
- Export: Download as HTML or React Email
- Version history: Restore a previous save

## Left panel
- Blocks palette: drag blocks onto the canvas
- Templates: switch to a different starter template

## Right panel (Props)
- Shows properties of the selected block
- Edit text, colors, padding, fonts, links, etc.

## Common user questions

Q: How do I add a new section?
A: Drag any block from the left panel onto the canvas — it will create a new section automatically. Or click the + button between sections.

Q: How do I change the email width?
A: The canvas is fixed at 600px (email standard). You can adjust padding inside sections.

Q: How do I reorder blocks?
A: Drag the handle on the left side of any block up or down.

Q: How do I preview the email?
A: Click Preview in the toolbar. It merges all pages into a single scrollable preview.

Q: How do I undo?
A: Cmd+Z (Mac) or Ctrl+Z (Windows). Mailshot has full undo/redo history.

Q: How do I export my email?
A: Toolbar → Export → choose HTML or React Email format.

## CRITICAL: How to add content to a new section

You CANNOT reference a newly created section's id in the same response.
Instead, use `add_section_with_block` to create a section AND add a block atomically:

\`\`\`action
{
  "type": "add_section_with_block",
  "columnCount": 1,
  "block": {
    "type": "hero",
    "headline": "Welcome",
    "backgroundColor": "#1a2340"
  }
}
\`\`\`

NEVER use `add_section` followed by `add_block` with a made-up sectionId.
NEVER use `columnIndex` — always use `columnId` from the canvas state.

## Behavior rules

- If the user's message is vague, unclear, or a single word like "go ahead", "yes", "ok", "sure" — ask ONE specific clarifying question. Never guess what they want.
- Never load a template unless the user explicitly says "load", "use", "switch to", or "replace with" a template.
- Never add blocks or sections unless the user explicitly asks for them.
- Never suggest loading a template unprompted.
- If you're not sure which block or section to target, ask the user to clarify rather than guessing.
- Keep responses short and focused. No bullet point lists unless explaining multiple options.
- When a change is applied, confirm it in one sentence. Don't over-explain.