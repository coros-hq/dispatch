![MailShot](src/assets/logo.svg)
# MailShot

> Open-source email newsletter builder — drag & drop canvas, live code editor, built-in compatibility testing.


---

## What is MailShot?

MailShot is a developer-friendly newsletter builder that lets you visually compose email templates and export battle-tested, email-client-compatible HTML. No subscriptions, no platform lock-in — just build and export.

---

## Features

- **Drag & drop canvas** — Notion-style block handles, reorder sections and blocks freely
- **Section layouts** — Full width, two-column, and three-column layouts
- **5 block types** — Text, Image, Button, Divider, Spacer
- **Props panel** — Click any block or section to edit its properties
- **Live code pane** — See the React Email component update in real time as you build
- **Email-safe HTML export** — Table-based layout, inlined styles, Outlook conditionals
- **React Email export** — Copy a ready-to-use React Email component
- **Send test email** — Send your newsletter to any inbox via Resend
- **Compatibility linter** — Instant warnings for known email client issues (Gmail, Outlook, Apple Mail)

---

## Stack

| Layer | Choice |
|---|---|
| Framework | React + Vite |
| Language | TypeScript |
| Styling | Tailwind v4 + shadcn/ui |
| Drag & drop | @dnd-kit/core |
| Code editor | Monaco Editor |
| State | Zustand |
| Email testing | Resend API |

---

## Getting started

### Prerequisites

- Node.js 18+
- A [Resend](https://resend.com) account for sending test emails (free tier is enough)

### Installation

```bash
git clone https://github.com/yourusername/mailshot.git
cd mailshot
npm install
```

### Environment variables

Create a `.env` file in the root:

```
VITE_RESEND_API_KEY=your_resend_api_key
```

### Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Usage

1. **Add a section** — click Full width, Two columns, or Three columns from the left panel
2. **Add blocks** — drag Text, Image, Button, Divider, or Spacer into any column
3. **Edit properties** — click any block or section to edit in the right panel
4. **Check compatibility** — the linter panel flags known email client issues automatically
5. **Send a test** — hit Send Test Email, enter your address, check your inbox
6. **Export** — Copy code for a React Email component or Export HTML for raw email-safe markup

## Contributing

Contributions are welcome. Open an issue first to discuss what you'd like to change.

---

## License

MIT
