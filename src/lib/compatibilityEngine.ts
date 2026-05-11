import type { Canvas } from "../types";
import { canvasToHtml } from "./renderer";

export type ClientSupport = "yes" | "partial" | "no";

export type Issue = {
  property: string;
  support: ClientSupport;
  description: string;
  clients: string[];
};

export type ClientResult = {
  name: string;
  score: number;
  issues: Issue[];
};

export type CompatibilityReport = {
  clients: ClientResult[];
  generatedAt: string;
};

// Curated rules based on known email client behavior
// Sources: caniemail.com, Litmus, EmailOnAcid documentation
const RULES: {
  id: string;
  property: string;
  description: string;
  detect: (html: string) => boolean;
  support: Record<string, ClientSupport>;
}[] = [
  {
    id: "border-radius",
    property: "border-radius",
    description:
      "Rounded corners are ignored — elements will appear with square corners",
    detect: (html) => /border-radius\s*:/i.test(html),
    support: {
      Gmail: "yes",
      "Apple Mail": "yes",
      Outlook: "no",
      "Yahoo Mail": "yes",
      "Samsung Email": "partial",
      Thunderbird: "yes",
    },
  },
  {
    id: "web-fonts",
    property: "Custom web fonts",
    description:
      "Web fonts via @font-face or Google Fonts will fall back to system fonts",
    detect: (html) => /@font-face|fonts\.googleapis/i.test(html),
    support: {
      Gmail: "no",
      "Apple Mail": "yes",
      Outlook: "no",
      "Yahoo Mail": "no",
      "Samsung Email": "no",
      Thunderbird: "partial",
    },
  },
  {
    id: "background-image",
    property: "background-image",
    description: "Background images are not supported and will not render",
    detect: (html) => /background-image\s*:/i.test(html),
    support: {
      Gmail: "no",
      "Apple Mail": "yes",
      Outlook: "no",
      "Yahoo Mail": "partial",
      "Samsung Email": "partial",
      Thunderbird: "yes",
    },
  },
  {
    id: "flexbox",
    property: "display:flex",
    description:
      "Flexbox layout is not supported — use table-based layouts instead",
    detect: (html) => /display\s*:\s*flex/i.test(html),
    support: {
      Gmail: "no",
      "Apple Mail": "partial",
      Outlook: "no",
      "Yahoo Mail": "no",
      "Samsung Email": "no",
      Thunderbird: "partial",
    },
  },
  {
    id: "css-grid",
    property: "display:grid",
    description: "CSS Grid is not supported in any major email client",
    detect: (html) => /display\s*:\s*grid/i.test(html),
    support: {
      Gmail: "no",
      "Apple Mail": "no",
      Outlook: "no",
      "Yahoo Mail": "no",
      "Samsung Email": "no",
      Thunderbird: "no",
    },
  },
  {
    id: "position",
    property: "position",
    description: "CSS positioning (absolute/relative/fixed) is not supported",
    detect: (html) => /position\s*:\s*(absolute|relative|fixed)/i.test(html),
    support: {
      Gmail: "no",
      "Apple Mail": "partial",
      Outlook: "no",
      "Yahoo Mail": "no",
      "Samsung Email": "no",
      Thunderbird: "partial",
    },
  },
  {
    id: "css-animation",
    property: "CSS animations",
    description: "Animations and transitions are not supported in most clients",
    detect: (html) => /animation|@keyframes|transition\s*:/i.test(html),
    support: {
      Gmail: "no",
      "Apple Mail": "yes",
      Outlook: "no",
      "Yahoo Mail": "no",
      "Samsung Email": "no",
      Thunderbird: "no",
    },
  },
  {
    id: "max-width",
    property: "max-width",
    description: "max-width is ignored in some Outlook versions",
    detect: (html) => /max-width\s*:/i.test(html),
    support: {
      Gmail: "yes",
      "Apple Mail": "yes",
      Outlook: "partial",
      "Yahoo Mail": "yes",
      "Samsung Email": "yes",
      Thunderbird: "yes",
    },
  },
  {
    id: "video",
    property: "<video> element",
    description:
      "Video elements are not supported — use an image with a play button instead",
    detect: (html) => /<video/i.test(html),
    support: {
      Gmail: "no",
      "Apple Mail": "yes",
      Outlook: "no",
      "Yahoo Mail": "no",
      "Samsung Email": "no",
      Thunderbird: "no",
    },
  },
  {
    id: "svg",
    property: "<svg> element",
    description: "SVG images are not supported — use PNG or JPG instead",
    detect: (html) => /<svg|\.svg"/i.test(html),
    support: {
      Gmail: "no",
      "Apple Mail": "yes",
      Outlook: "no",
      "Yahoo Mail": "no",
      "Samsung Email": "no",
      Thunderbird: "yes",
    },
  },
  {
    id: "font-size-small",
    property: "Small font size",
    description:
      "Font sizes below 11px are auto-resized on iOS — use 11px minimum",
    detect: (html) => {
      const matches = html.matchAll(/font-size\s*:\s*(\d+)px/gi);
      for (const match of matches) {
        if (parseInt(match[1]) < 11) return true;
      }
      return false;
    },
    support: {
      Gmail: "yes",
      "Apple Mail": "partial",
      Outlook: "yes",
      "Yahoo Mail": "yes",
      "Samsung Email": "yes",
      Thunderbird: "yes",
    },
  },
  {
    id: "http-images",
    property: "HTTP images",
    description:
      "Images served over HTTP (not HTTPS) are blocked by most clients",
    detect: (html) => /src="http:\/\//i.test(html),
    support: {
      Gmail: "no",
      "Apple Mail": "no",
      Outlook: "no",
      "Yahoo Mail": "no",
      "Samsung Email": "no",
      Thunderbird: "no",
    },
  },
  {
    id: "missing-alt",
    property: "Missing alt text",
    description:
      "Images without alt text show broken icons when images are blocked",
    detect: (html) => /<img(?![^>]*alt=)[^>]*>/i.test(html),
    support: {
      Gmail: "partial",
      "Apple Mail": "partial",
      Outlook: "partial",
      "Yahoo Mail": "partial",
      "Samsung Email": "partial",
      Thunderbird: "partial",
    },
  },
];

const EMAIL_CLIENTS = [
  "Gmail",
  "Apple Mail",
  "Outlook",
  "Yahoo Mail",
  "Samsung Email",
  "Thunderbird",
];

export async function generateCompatibilityReport(
  canvas: Canvas,
): Promise<CompatibilityReport> {
  const html = canvasToHtml(canvas);

  const clients: ClientResult[] = EMAIL_CLIENTS.map((clientName) => {
    const issues: Issue[] = [];

    for (const rule of RULES) {
      if (!rule.detect(html)) continue;

      const support = rule.support[clientName] ?? "yes";
      if (support !== "yes") {
        issues.push({
          property: rule.property,
          support,
          description: rule.description,
          clients: Object.entries(rule.support)
            .filter(([, s]) => s !== "yes")
            .map(([c]) => c),
        });
      }
    }

    const detectedRules = RULES.filter((r) => r.detect(html));

    const score =
      detectedRules.length === 0
        ? 100
        : Math.round(
            (detectedRules.reduce((acc, rule) => {
              const support = rule.support[clientName] ?? "yes";
              if (support === "yes") return acc + 1;
              if (support === "partial") return acc + 0.6;
              return acc + 0; // 'no'
            }, 0) /
              detectedRules.length) *
              100,
          );

    return { name: clientName, score, issues };
  });

  return {
    clients,
    generatedAt: new Date().toISOString(),
  };
}
