import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import type { IncomingMessage, ServerResponse } from "http";
import {
  buildInviteEmailPayload,
  type InviteEmailParams,
} from "./api/lib/build-invite-email";
import { adaptVercelHandler, readJsonBody } from "./api/lib/dev-adapter";

const CAMPAIGN_API_ROUTES: Record<
  string,
  () => Promise<{
    default: (
      req: import("@vercel/node").VercelRequest,
      res: import("@vercel/node").VercelResponse,
    ) => Promise<unknown>;
  }>
> = {
  "/api/auth/gmail": () => import("./api/auth/gmail"),
  "/api/auth/gmail/callback": () => import("./api/auth/gmail/callback"),
  "/api/auth/outlook": () => import("./api/auth/outlook"),
  "/api/auth/outlook/callback": () => import("./api/auth/outlook/callback"),
  "/api/send-campaign": () => import("./api/send-campaign"),
  "/api/unsubscribe": () => import("./api/unsubscribe"),
  "/api/smtp-verify": () => import("./api/smtp-verify"),
  "/api/assistant": () => import("./api/assistant"),
};

function inviteApiDevPlugin(env: Record<string, string>): Plugin {
  return {
    name: "invite-api-dev",
    configureServer(server) {
      server.middlewares.use(
        async (
          req: IncomingMessage,
          res: ServerResponse,
          next: (err?: Error) => void,
        ) => {
          const rawUrl = req.url ?? "/";
          const parsedUrl = new URL(rawUrl, "http://localhost");
          const pathname = parsedUrl.pathname;

          const campaignRoute = CAMPAIGN_API_ROUTES[pathname];
          if (campaignRoute) {
            if (!process.env.APP_URL) {
              process.env.APP_URL = `http://localhost:${server.config.server.port}`;
            }
            process.env.VITE_SUPABASE_URL ??= env.VITE_SUPABASE_URL;
            process.env.SUPABASE_URL ??= env.VITE_SUPABASE_URL;
            process.env.VITE_SUPABASE_SERVICE_KEY ??=
              env.VITE_SUPABASE_SERVICE_KEY;
            process.env.GOOGLE_CLIENT_ID ??= env.GOOGLE_CLIENT_ID;
            process.env.GOOGLE_CLIENT_SECRET ??= env.GOOGLE_CLIENT_SECRET;
            process.env.MICROSOFT_CLIENT_ID ??= env.MICROSOFT_CLIENT_ID;
            process.env.MICROSOFT_CLIENT_SECRET ??= env.MICROSOFT_CLIENT_SECRET;
            process.env.OLLAMA_URL ??= env.OLLAMA_URL;
            process.env.OLLAMA_MODEL ??= env.OLLAMA_MODEL;
            process.env.OLLAMA_SECRET ??= env.OLLAMA_SECRET;

            try {
              const mod = await campaignRoute();
              const body =
                req.method === "POST" ? await readJsonBody(req) : undefined;
              await adaptVercelHandler(mod.default)(req, res, parsedUrl, body);
            } catch (err) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error:
                    err instanceof Error
                      ? err.message
                      : "Internal server error",
                }),
              );
            }
            return;
          }

          if (pathname !== "/api/invite") return next();

          if (req.method !== "POST") {
            res.statusCode = 405;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Method not allowed" }));
            return;
          }

          const apiKey = env.RESEND_API_KEY;
          if (!apiKey) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error:
                  "RESEND_API_KEY is not set. Add it to your .env.local file.",
              }),
            );
            return;
          }

          try {
            const body = (await readJsonBody(req)) as InviteEmailParams;
            const { to, teamName, inviterName, role, inviteUrl } = body;

            if (!to || !teamName || !inviterName || !role || !inviteUrl) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Missing required fields" }));
              return;
            }

            const response = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify(
                buildInviteEmailPayload({
                  to,
                  teamName,
                  inviterName,
                  role,
                  inviteUrl,
                }),
              ),
            });

            const data = await response.json();
            res.statusCode = response.status;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error:
                  err instanceof Error ? err.message : "Failed to send invite",
              }),
            );
          }
        },
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss(), inviteApiDevPlugin(env)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api/resend": {
          target: "https://api.resend.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/resend/, ""),
        },
      },
    },
  };
});
