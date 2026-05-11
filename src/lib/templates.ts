import { v4 as uuid } from "uuid";
import type { Template } from "../types";

function makeTemplate(
  name: string,
  sections: any[],
  globalStyles: any,
): Template {
  const canvasId = uuid();
  return {
    id: uuid(),
    name,
    canvases: [
      {
        id: canvasId,
        name: "Canvas 1",
        sections,
        globalStyles,
      },
    ],
    activeCanvasId: canvasId,
  };
}

export const STARTER_TEMPLATES: Template[] = [
  makeTemplate(
    "Minimal",
    [
      {
        id: uuid(),
        columns: [
          {
            id: uuid(),
            blocks: [
              {
                id: uuid(),
                type: "text",
                content: "Your Newsletter",
                fontSize: 28,
                color: "#111111",
                align: "center" as const,
                fontWeight: "bold" as const,
              },
              {
                id: uuid(),
                type: "text",
                content:
                  "Welcome to this week's edition. Here's what we've been working on.",
                fontSize: 16,
                color: "#444444",
                align: "center" as const,
                fontWeight: "normal" as const,
              },
              {
                id: uuid(),
                type: "button",
                label: "Read More",
                href: "https://example.com",
                bgColor: "#111111",
                textColor: "#ffffff",
                borderRadius: 6,
              },
            ],
          },
        ],
        bgColor: "#ffffff",
        paddingTop: 48,
        paddingBottom: 48,
        paddingLeft: 32,
        paddingRight: 32,
      },
    ],
    { fontFamily: "Georgia, serif", bgColor: "#f4f4f4", contentWidth: 600 },
  ),

  makeTemplate(
    "Product Launch",
    [
      {
        id: uuid(),
        columns: [
          {
            id: uuid(),
            blocks: [
              {
                id: uuid(),
                type: "image",
                src: "https://placehold.co/600x300",
                alt: "Product hero",
                width: 600,
              },
            ],
          },
        ],
        bgColor: "#111111",
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
      },
      {
        id: uuid(),
        columns: [
          {
            id: uuid(),
            blocks: [
              {
                id: uuid(),
                type: "text",
                content: "Introducing Our New Product",
                fontSize: 26,
                color: "#111111",
                align: "center" as const,
                fontWeight: "bold" as const,
              },
              {
                id: uuid(),
                type: "text",
                content:
                  "We've been building something special. Today we're excited to share it with you.",
                fontSize: 15,
                color: "#555555",
                align: "center" as const,
                fontWeight: "normal" as const,
              },
              {
                id: uuid(),
                type: "button",
                label: "Get Early Access",
                href: "https://example.com",
                bgColor: "#111111",
                textColor: "#ffffff",
                borderRadius: 4,
              },
            ],
          },
        ],
        bgColor: "#ffffff",
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 32,
        paddingRight: 32,
      },
    ],
    { fontFamily: "Inter, sans-serif", bgColor: "#f4f4f4", contentWidth: 600 },
  ),

  makeTemplate(
    "Weekly Digest",
    [
      {
        id: uuid(),
        columns: [
          {
            id: uuid(),
            blocks: [
              {
                id: uuid(),
                type: "text",
                content: "Weekly Digest",
                fontSize: 22,
                color: "#ffffff",
                align: "center" as const,
                fontWeight: "bold" as const,
              },
              {
                id: uuid(),
                type: "text",
                content: "Issue #42 — This week in review",
                fontSize: 13,
                color: "#ffffff",
                align: "center" as const,
                fontWeight: "normal" as const,
              },
            ],
          },
        ],
        bgColor: "#111111",
        paddingTop: 32,
        paddingBottom: 32,
        paddingLeft: 32,
        paddingRight: 32,
      },
      {
        id: uuid(),
        columns: [
          {
            id: uuid(),
            blocks: [
              {
                id: uuid(),
                type: "text",
                content: "01 — Article Title",
                fontSize: 18,
                color: "#111111",
                align: "left" as const,
                fontWeight: "bold" as const,
              },
              {
                id: uuid(),
                type: "text",
                content:
                  "A short summary of the article goes here. Keep it to two or three sentences max.",
                fontSize: 14,
                color: "#555555",
                align: "left" as const,
                fontWeight: "normal" as const,
              },
              { id: uuid(), type: "divider", color: "#eeeeee", thickness: 1 },
              {
                id: uuid(),
                type: "text",
                content: "02 — Article Title",
                fontSize: 18,
                color: "#111111",
                align: "left" as const,
                fontWeight: "bold" as const,
              },
              {
                id: uuid(),
                type: "text",
                content:
                  "A short summary of the article goes here. Keep it to two or three sentences max.",
                fontSize: 14,
                color: "#555555",
                align: "left" as const,
                fontWeight: "normal" as const,
              },
              { id: uuid(), type: "divider", color: "#eeeeee", thickness: 1 },
              {
                id: uuid(),
                type: "text",
                content: "03 — Article Title",
                fontSize: 18,
                color: "#111111",
                align: "left" as const,
                fontWeight: "bold" as const,
              },
              {
                id: uuid(),
                type: "text",
                content:
                  "A short summary of the article goes here. Keep it to two or three sentences max.",
                fontSize: 14,
                color: "#555555",
                align: "left" as const,
                fontWeight: "normal" as const,
              },
            ],
          },
        ],
        bgColor: "#ffffff",
        paddingTop: 32,
        paddingBottom: 32,
        paddingLeft: 32,
        paddingRight: 32,
      },
    ],
    { fontFamily: "Inter, sans-serif", bgColor: "#f0f0f0", contentWidth: 600 },
  ),

  makeTemplate(
    "Welcome Email",
    [
      {
        id: uuid(),
        columns: [
          {
            id: uuid(),
            blocks: [
              {
                id: uuid(),
                type: "text",
                content: "Welcome aboard 👋",
                fontSize: 30,
                color: "#111111",
                align: "center" as const,
                fontWeight: "bold" as const,
              },
              { id: uuid(), type: "spacer", height: 16 },
              {
                id: uuid(),
                type: "text",
                content:
                  "We're so glad you're here. Let's get you set up and ready to go.",
                fontSize: 16,
                color: "#555555",
                align: "center" as const,
                fontWeight: "normal" as const,
              },
              { id: uuid(), type: "spacer", height: 24 },
              {
                id: uuid(),
                type: "button",
                label: "Get Started",
                href: "https://example.com",
                bgColor: "#111111",
                textColor: "#ffffff",
                borderRadius: 8,
              },
            ],
          },
        ],
        bgColor: "#ffffff",
        paddingTop: 56,
        paddingBottom: 56,
        paddingLeft: 40,
        paddingRight: 40,
      },
    ],
    { fontFamily: "Inter, sans-serif", bgColor: "#f9f9f9", contentWidth: 560 },
  ),

  makeTemplate(
    "Promotional",
    [
      {
        id: uuid(),
        columns: [
          {
            id: uuid(),
            blocks: [
              {
                id: uuid(),
                type: "text",
                content: "🎉 Limited Time Offer",
                fontSize: 13,
                color: "#ffffff",
                align: "center" as const,
                fontWeight: "normal" as const,
              },
              {
                id: uuid(),
                type: "text",
                content: "50% OFF",
                fontSize: 48,
                color: "#ffffff",
                align: "center" as const,
                fontWeight: "bold" as const,
              },
              {
                id: uuid(),
                type: "text",
                content: "Use code DISPATCH50 at checkout",
                fontSize: 14,
                color: "#ffffff",
                align: "center" as const,
                fontWeight: "normal" as const,
              },
            ],
          },
        ],
        bgColor: "#2563eb",
        paddingTop: 48,
        paddingBottom: 48,
        paddingLeft: 32,
        paddingRight: 32,
      },
      {
        id: uuid(),
        columns: [
          {
            id: uuid(),
            blocks: [
              {
                id: uuid(),
                type: "text",
                content: "Don't miss out",
                fontSize: 20,
                color: "#111111",
                align: "center" as const,
                fontWeight: "bold" as const,
              },
              {
                id: uuid(),
                type: "text",
                content:
                  "This offer expires in 48 hours. Grab it before it's gone.",
                fontSize: 14,
                color: "#555555",
                align: "center" as const,
                fontWeight: "normal" as const,
              },
              {
                id: uuid(),
                type: "button",
                label: "Claim Your Discount",
                href: "https://example.com",
                bgColor: "#2563eb",
                textColor: "#ffffff",
                borderRadius: 6,
              },
            ],
          },
        ],
        bgColor: "#ffffff",
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 32,
        paddingRight: 32,
      },
    ],
    { fontFamily: "Inter, sans-serif", bgColor: "#f4f4f4", contentWidth: 600 },
  ),
];
