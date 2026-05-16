import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import type { IncomingMessage, ServerResponse } from "http";
import {
  buildInviteEmailPayload,
  type InviteEmailParams,
} from "./api/lib/build-invite-email";

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

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
          const url = req.url?.split("?")[0];
          if (url !== "/api/invite") return next();

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
