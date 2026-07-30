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

## Self-hosting

MailShot is fully self-hostable. It's a Vite/React frontend backed by a set of small serverless-style API handlers (`/api/*`) that talk to Postgres (via Supabase) and Resend. This section walks through running your own instance from scratch.

### Prerequisites

- Node.js 18+
- A Postgres database. The easiest path is a free [Supabase](https://supabase.com) project (gives you Postgres + auth out of the box); any Postgres instance works for the `DATABASE_URL` connection itself, but the auth/session flow currently relies on Supabase Auth specifically.
- A [Resend](https://resend.com) account for sending campaigns and test emails (free tier is enough)
- Optional: a Google Cloud OAuth client (for "Send via Gmail") and/or a Microsoft Entra app registration (for "Send via Outlook")
- Optional: a running [Ollama](https://ollama.com) instance if you want the in-app AI assistant

### 1. Clone and install

```bash
git clone https://github.com/yourusername/mailshot.git
cd mailshot
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com) (or point at a self-hosted Supabase stack).
2. In **Project Settings → API**, grab the project URL, the `anon` public key, and the `service_role` secret key.
3. In **Project Settings → Database**, grab the connection string for `DATABASE_URL`.
4. Enable email/password auth (or whichever providers you want) under **Authentication → Providers**.
5. There are no tracked SQL migrations in this repo yet — the app expects the tables/columns it reads and writes (workspaces, projects, campaigns, contacts, etc.) to already exist in your Supabase project. If you're setting up a brand-new instance, inspect `src/lib/supabase.ts` and the handlers under `api/` and `api/lib/` for the tables/columns each query touches, and create matching tables in the Supabase SQL editor before running the app.

### 3. Configure environment variables

Create a `.env` file in the project root:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # server-side only, keep secret
SUPABASE_ENCRYPTION_KEY=a_random_32+_char_secret  # used to encrypt stored OAuth tokens
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# App
APP_URL=http://localhost:5173   # public URL of your instance, used to build OAuth redirect URIs

# Resend (campaign sending, test sends, invites)
RESEND_API_KEY=your_resend_api_key
RESEND_SENDING_DOMAIN=yourdomain.com   # a domain verified in Resend

# Gmail send-as (optional)
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# Outlook send-as (optional)
MICROSOFT_CLIENT_ID=your_microsoft_app_id
MICROSOFT_CLIENT_SECRET=your_microsoft_app_secret

# In-app AI assistant (optional)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:latest
OLLAMA_SECRET=a_shared_secret_for_the_assistant_endpoint
```

Never commit `.env` — it's already covered by `.gitignore`.

**If you enable Gmail/Outlook sending**, register OAuth apps and set their redirect URIs to:
- Google: `${APP_URL}/api/auth/gmail/callback`
- Microsoft: `${APP_URL}/api/auth/outlook/callback`

### 4. Run in development

```bash
npm run dev
```

This starts Vite on [http://localhost:5173](http://localhost:5173) with a dev middleware that serves every handler under `/api/*` (auth, campaigns, assistant, unsubscribe, SMTP verification) directly — no separate process needed for local development.

There's also a minimal standalone Express server (`api-server.ts`, started via `npm run dev:api` or together with the frontend via `npm run dev:all`) that only wires up `/api/smtp-verify` and `/api/send-campaign`. It's a leftover convenience script, not a full backend — use the Vite dev middleware (`npm run dev`) for anything involving auth, OAuth, or the assistant.

### 5. Build and deploy for production

```bash
npm run build
```

This type-checks and produces a static `dist/` bundle. In production, the `/api/*` routes need to run as serverless functions (this repo ships with `@vercel/node` types and a `vercel.json` rewrite, so deploying to [Vercel](https://vercel.com) works out of the box: import the repo, set the environment variables from step 3 in the project settings, and deploy).

To self-host on your own infrastructure instead of Vercel, you'll need to adapt the handlers in `api/` (they use the `VercelRequest`/`VercelResponse` shape) to whatever server you're running — the `adaptVercelHandler` helper in `api/lib/dev-adapter.ts` shows how the Vite dev server does this, and can be reused as the basis for a production Express/Node server that serves `dist/` as static files and mounts each `api/*.ts` handler at its matching route.

Whichever platform you use, make sure `APP_URL` matches the real public URL of the deployment (it's used to build OAuth callback URLs).

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
