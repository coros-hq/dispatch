import { getActiveCanvas } from "@/store/editor";
import type { Template } from "../types";

export type LintSeverity = "warning" | "error";

export type LintResult = {
  severity: LintSeverity;
  message: string;
  clients: string[];
};

export function lintTemplate(template: Template): LintResult[] {
  const results: LintResult[] = [];
  const activeCanvas = getActiveCanvas(template);
  const { sections, globalStyles } = activeCanvas;

  // Check global font family
  if (
    globalStyles.fontFamily.toLowerCase().includes("google") ||
    globalStyles.fontFamily.toLowerCase().includes("http")
  ) {
    results.push({
      severity: "warning",
      message: "Web font URLs may not load in some clients",
      clients: ["Gmail", "Outlook"],
    });
  }

  // Walk all blocks in all sections
  for (const section of sections) {
    for (const column of section.columns) {
      for (const block of column.blocks) {
        if (block.type === "text") {
          if (block.fontSize < 11) {
            results.push({
              severity: "warning",
              message: "Font size below 11px — iOS auto-resizes small text",
              clients: ["Apple Mail iOS"],
            });
          }
        }

        if (block.type === "button") {
          if (block.borderRadius > 0) {
            results.push({
              severity: "warning",
              message: "Border radius on buttons is ignored in Outlook",
              clients: ["Outlook 2016", "Outlook 2019", "Outlook 365"],
            });
          }
        }

        if (block.type === "image") {
          if (!block.alt || block.alt.trim() === "") {
            results.push({
              severity: "warning",
              message: "Image missing alt text — shown when images are blocked",
              clients: ["Gmail", "Outlook", "Apple Mail"],
            });
          }

          if (block.src.startsWith("http://")) {
            results.push({
              severity: "error",
              message: "Image uses HTTP — most clients block non-HTTPS images",
              clients: ["Gmail", "Outlook", "Apple Mail", "Yahoo Mail"],
            });
          }
        }
      }
    }
  }

  // Deduplicate same messages
  const seen = new Set<string>();
  return results.filter((r) => {
    if (seen.has(r.message)) return false;
    seen.add(r.message);
    return true;
  });
}
