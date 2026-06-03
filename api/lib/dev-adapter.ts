import type { IncomingMessage, ServerResponse } from "http";
import type { VercelRequest, VercelResponse } from "@vercel/node";

function parseQuery(url: URL): Record<string, string | string[]> {
  const query: Record<string, string | string[]> = {};
  for (const [key, value] of url.searchParams.entries()) {
    if (query[key]) {
      const existing = query[key];
      query[key] = Array.isArray(existing)
        ? [...existing, value]
        : [existing, value];
    } else {
      query[key] = value;
    }
  }
  return query;
}

export function readJsonBody(req: IncomingMessage): Promise<unknown> {
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

export function adaptVercelHandler(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<unknown>,
) {
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    parsedUrl: URL,
    body?: unknown,
  ) => {
    let statusCode = 200;
    const headers: Record<string, string | string[]> = {};

    const vercelRes = {
      status(code: number) {
        statusCode = code;
        return vercelRes;
      },
      setHeader(name: string, value: string | string[]) {
        headers[name.toLowerCase()] = value;
        return vercelRes;
      },
      json(data: unknown) {
        if (!headers["content-type"]) {
          headers["content-type"] = "application/json";
        }
        res.statusCode = statusCode;
        for (const [k, v] of Object.entries(headers)) {
          res.setHeader(k, v);
        }
        res.end(JSON.stringify(data));
      },
      send(data: string) {
        res.statusCode = statusCode;
        for (const [k, v] of Object.entries(headers)) {
          res.setHeader(k, v);
        }
        res.end(data);
      },
      redirect(status: number, location: string) {
        res.statusCode = status;
        res.setHeader("Location", location);
        res.end();
      },
    } as VercelResponse;

    const vercelReq = {
      method: req.method,
      query: parseQuery(parsedUrl),
      headers: req.headers as VercelRequest["headers"],
      body,
    } as VercelRequest;

    await handler(vercelReq, vercelRes);
  };
}
