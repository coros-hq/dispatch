import { v4 as uuid } from "uuid";
import type { Template } from "../types";

function makeTemplate(
  name: string,
  sections: any[],
  globalStyles: any,
): Template {
  const canvasId = uuid();
  const pageId = uuid();
  return {
    id: uuid(),
    name,
    pages: [
      {
        id: pageId,
        name: "Page 1",
        canvases: [
          {
            id: canvasId,
            name: "Variant 1",
            x: 0,
            y: 0,
            sections,
            globalStyles,
          },
        ],
        activeCanvasId: canvasId,
      },
    ],
    activePageId: pageId,
  };
}

const BRAND_NEWSLETTER_GLOBAL_STYLES = {
  fontFamily: "Inter, sans-serif",
  bgColor: "#1a2340",
  contentWidth: 600,
};

function brandNewsletterLogoStrip(): any {
  return {
    id: uuid(),
    columns: [
      {
        id: uuid(),
        blocks: [
          {
            id: uuid(),
            type: "logo-strip",
            logos: [
              {
                src: "https://placehold.co/80x40/ffffff/333333",
                alt: "Partenaire 1",
              },
              {
                src: "https://placehold.co/80x40/ffffff/333333",
                alt: "Partenaire 2",
              },
              {
                src: "https://placehold.co/80x40/ffffff/333333",
                alt: "Partenaire 3",
              },
              {
                src: "https://placehold.co/80x40/ffffff/333333",
                alt: "Partenaire 4",
              },
              {
                src: "https://placehold.co/80x40/ffffff/333333",
                alt: "Partenaire 5",
              },
              {
                src: "https://placehold.co/80x40/ffffff/333333",
                alt: "Partenaire 6",
              },
              {
                src: "https://placehold.co/80x40/ffffff/333333",
                alt: "Partenaire 7",
              },
              {
                src: "https://placehold.co/80x40/ffffff/333333",
                alt: "Partenaire 8",
              },
            ],
            align: "center" as const,
            logoHeight: 40,
            gap: 16,
            bgColor: "#ffffff",
          },
        ],
      },
    ],
    bgColor: "#ffffff",
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 24,
    paddingRight: 24,
  };
}

function makeBrandNewsletterTemplate(): Template {
  const gs = BRAND_NEWSLETTER_GLOBAL_STYLES;
  const c1 = uuid();
  const c2 = uuid();
  const c3 = uuid();
  const c4 = uuid();

  const canvas1Sections = [
    {
      id: uuid(),
      columns: [
        {
          id: uuid(),
          blocks: [
            {
              id: uuid(),
              type: "hero",
              backgroundImage:
                "https://placehold.co/600x300/1a2340/ffffff",
              title: "NEWSLETTER",
              subtitle: "N°01 — MARS 2026",
              buttonLabel: "Parcourir",
              buttonHref: "https://example.com",
              buttonBgColor: "#ffffff",
              buttonTextColor: "#1a2340",
              overlayColor: "rgba(26,35,64,0.5)",
              textColor: "#ffffff",
              align: "center" as const,
              minHeight: 300,
            },
          ],
        },
      ],
      bgColor: "#1a2340",
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
              type: "nav-bar",
              logoSrc: "https://placehold.co/120x40/ffffff/1a2340",
              logoAlt: "Logo",
              logoWidth: 120,
              links: [
                {
                  label: "N°01 MARS 2026",
                  href: "https://example.com",
                },
              ],
              bgColor: "#1a2340",
              linkColor: "#ffffff",
            },
          ],
        },
      ],
      bgColor: "#1a2340",
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
              content: "RAMADAN, À VOTRE RYTHME",
              fontSize: 32,
              color: "#ffffff",
              align: "center" as const,
              fontWeight: "bold" as const,
            },
            { id: uuid(), type: "spacer", height: 12 },
            {
              id: uuid(),
              type: "text",
              content:
                "Menus légers, routines douces et instants à partager sans se presser.",
              fontSize: 16,
              color: "#cbd5e1",
              align: "center" as const,
              fontWeight: "normal" as const,
            },
          ],
        },
      ],
      bgColor: "#1a2340",
      paddingTop: 40,
      paddingBottom: 40,
      paddingLeft: 32,
      paddingRight: 32,
    },
    {
      id: uuid(),
      columns: [
        {
          id: uuid(),
          width: 50,
          verticalAlign: "top" as const,
          blocks: [
            {
              id: uuid(),
              type: "image",
              src: "https://placehold.co/120x40/ffffff/1a2340",
              alt: "Logo",
              width: 120,
            },
            { id: uuid(), type: "spacer", height: 16 },
            {
              id: uuid(),
              type: "text",
              content: "Nouveau partenaire",
              fontSize: 22,
              color: "#ffffff",
              align: "left" as const,
              fontWeight: "bold" as const,
            },
            { id: uuid(), type: "spacer", height: 12 },
            {
              id: uuid(),
              type: "text",
              content:
                "Nous accueillons Alya pour des recettes et rituels qui respectent votre énergie tout au long du mois.",
              fontSize: 15,
              color: "#e2e8f0",
              align: "left" as const,
              fontWeight: "normal" as const,
            },
            { id: uuid(), type: "spacer", height: 12 },
            {
              id: uuid(),
              type: "text",
              content:
                "Tables conviviales, épices douces et inspiration quotidienne — pensé pour les soirées qui s'étirent.",
              fontSize: 15,
              color: "#e2e8f0",
              align: "left" as const,
              fontWeight: "normal" as const,
            },
            { id: uuid(), type: "spacer", height: 16 },
            {
              id: uuid(),
              type: "text",
              content: "Une saison pour honorer chaque rythme, ensemble.",
              fontSize: 16,
              color: "#ffffff",
              align: "left" as const,
              fontWeight: "bold" as const,
            },
            { id: uuid(), type: "spacer", height: 20 },
            {
              id: uuid(),
              type: "button",
              label: "Découvrir avec Alya",
              href: "https://example.com",
              bgColor: "#2563eb",
              textColor: "#ffffff",
              borderRadius: 4,
              align: "left" as const,
            },
          ],
        },
        {
          id: uuid(),
          width: 50,
          verticalAlign: "top" as const,
          blocks: [
            {
              id: uuid(),
              type: "image-grid",
              images: [
                {
                  src: "https://placehold.co/280x200/cccccc/666666",
                  alt: "Galerie 1",
                },
                {
                  src: "https://placehold.co/280x200/cccccc/666666",
                  alt: "Galerie 2",
                },
                {
                  src: "https://placehold.co/280x200/cccccc/666666",
                  alt: "Galerie 3",
                },
                {
                  src: "https://placehold.co/280x200/cccccc/666666",
                  alt: "Galerie 4",
                },
              ],
              columns: 2 as const,
              gap: 10,
              borderRadius: 6,
            },
          ],
        },
      ],
      bgColor: "#1a2340",
      paddingTop: 32,
      paddingBottom: 32,
      paddingLeft: 28,
      paddingRight: 28,
      columnGap: 20,
    },
    brandNewsletterLogoStrip(),
  ];

  const articlePageSectionsA = [
    {
      id: uuid(),
      columns: [
        {
          id: uuid(),
          width: 50,
          verticalAlign: "top" as const,
          blocks: [
            {
              id: uuid(),
              type: "image",
              src: "https://placehold.co/120x40/ffffff/1a2340",
              alt: "Logo",
              width: 120,
            },
            { id: uuid(), type: "spacer", height: 16 },
            {
              id: uuid(),
              type: "text",
              content: "L'esthétique du partage",
              fontSize: 24,
              color: "#ffffff",
              align: "left" as const,
              fontWeight: "bold" as const,
            },
            { id: uuid(), type: "spacer", height: 14 },
            {
              id: uuid(),
              type: "text",
              content:
                "Le geste simple d'inviter, de disposer la table et d'allumer une bougie transforme un dîner ordinaire en souvenir.",
              fontSize: 15,
              color: "#e2e8f0",
              align: "left" as const,
              fontWeight: "normal" as const,
            },
            { id: uuid(), type: "spacer", height: 12 },
            {
              id: uuid(),
              type: "text",
              content:
                "Nous aimons les contrastes : porcelaine fine, nappes texturées, casseroles qui racontent des voyages.",
              fontSize: 15,
              color: "#e2e8f0",
              align: "left" as const,
              fontWeight: "normal" as const,
            },
            { id: uuid(), type: "spacer", height: 12 },
            {
              id: uuid(),
              type: "text",
              content:
                "Cette page explore comment la mise en scène crée une chaleur durable, même quand le menu est minimaliste.",
              fontSize: 15,
              color: "#e2e8f0",
              align: "left" as const,
              fontWeight: "normal" as const,
            },
            { id: uuid(), type: "spacer", height: 16 },
            {
              id: uuid(),
              type: "text",
              content: "Une invitation à ralentir.",
              fontSize: 16,
              color: "#ffffff",
              align: "left" as const,
              fontWeight: "bold" as const,
            },
            { id: uuid(), type: "spacer", height: 20 },
            {
              id: uuid(),
              type: "button",
              label: "Lire l'article",
              href: "https://example.com",
              bgColor: "#2563eb",
              textColor: "#ffffff",
              borderRadius: 4,
              align: "left" as const,
            },
          ],
        },
        {
          id: uuid(),
          width: 50,
          verticalAlign: "top" as const,
          blocks: [
            {
              id: uuid(),
              type: "image",
              src: "https://placehold.co/520x320/bbd4e8/1a2340",
              alt: "Visuel principal",
              width: 280,
            },
            { id: uuid(), type: "spacer", height: 14 },
            {
              id: uuid(),
              type: "image-grid",
              images: [
                {
                  src: "https://placehold.co/260x180/d4d4d8/52525b",
                  alt: "Détail 1",
                },
                {
                  src: "https://placehold.co/260x180/c7d2fe/312e81",
                  alt: "Détail 2",
                },
              ],
              columns: 2 as const,
              gap: 8,
              borderRadius: 6,
            },
            { id: uuid(), type: "spacer", height: 14 },
            {
              id: uuid(),
              type: "text",
              content:
                "Les textures bois, lin et céramique matte ajoutent une profondeur silencieuse — suffisante pour ancrer la conversation.",
              fontSize: 14,
              color: "#cbd5e1",
              align: "left" as const,
              fontWeight: "normal" as const,
            },
            { id: uuid(), type: "spacer", height: 14 },
            {
              id: uuid(),
              type: "image",
              src: "https://placehold.co/520x280/e2e8f0/1a2340",
              alt: "Portrait ambiance",
              width: 280,
            },
          ],
        },
      ],
      bgColor: "#1a2340",
      paddingTop: 32,
      paddingBottom: 32,
      paddingLeft: 28,
      paddingRight: 28,
      columnGap: 20,
    },
    brandNewsletterLogoStrip(),
  ];

  const articlePageSectionsB = [
    {
      id: uuid(),
      columns: [
        {
          id: uuid(),
          width: 50,
          verticalAlign: "top" as const,
          blocks: [
            {
              id: uuid(),
              type: "image",
              src: "https://placehold.co/120x40/ffffff/1a2340",
              alt: "Logo",
              width: 120,
            },
            { id: uuid(), type: "spacer", height: 16 },
            {
              id: uuid(),
              type: "text",
              content: "L'Alignement du Corps",
              fontSize: 24,
              color: "#ffffff",
              align: "left" as const,
              fontWeight: "bold" as const,
            },
            { id: uuid(), type: "spacer", height: 14 },
            {
              id: uuid(),
              type: "text",
              content:
                "Le corps révèle ce que le calendrier tait : besoin d'air, d'étirements et de pauses réelles, pas seulement planifiées.",
              fontSize: 15,
              color: "#e2e8f0",
              align: "left" as const,
              fontWeight: "normal" as const,
            },
            { id: uuid(), type: "spacer", height: 12 },
            {
              id: uuid(),
              type: "text",
              content:
                "Respiration basse, colonne allongée, regards détendus — de petits ajustements qui rendent la journée plus lisible.",
              fontSize: 15,
              color: "#e2e8f0",
              align: "left" as const,
              fontWeight: "normal" as const,
            },
            { id: uuid(), type: "spacer", height: 12 },
            {
              id: uuid(),
              type: "text",
              content:
                "Ici, on parle alignement comme une pratique, pas une performance : suffisamment pour tenir, jamais pour se punir.",
              fontSize: 15,
              color: "#e2e8f0",
              align: "left" as const,
              fontWeight: "normal" as const,
            },
            { id: uuid(), type: "spacer", height: 16 },
            {
              id: uuid(),
              type: "text",
              content: "Le mouvement comme langue intérieure.",
              fontSize: 16,
              color: "#ffffff",
              align: "left" as const,
              fontWeight: "bold" as const,
            },
            { id: uuid(), type: "spacer", height: 20 },
            {
              id: uuid(),
              type: "button",
              label: "Explorer la pratique",
              href: "https://example.com",
              bgColor: "#2563eb",
              textColor: "#ffffff",
              borderRadius: 4,
              align: "left" as const,
            },
          ],
        },
        {
          id: uuid(),
          width: 50,
          verticalAlign: "top" as const,
          blocks: [
            {
              id: uuid(),
              type: "image",
              src: "https://placehold.co/520x320/fecdd3/9f1239",
              alt: "Atelier mouvement",
              width: 280,
            },
            { id: uuid(), type: "spacer", height: 14 },
            {
              id: uuid(),
              type: "image-grid",
              images: [
                {
                  src: "https://placehold.co/260x180/dcfce7/14532d",
                  alt: "Étirement",
                },
                {
                  src: "https://placehold.co/260x180/ede9fe/4c1d95",
                  alt: "Posture",
                },
              ],
              columns: 2 as const,
              gap: 8,
              borderRadius: 6,
            },
            { id: uuid(), type: "spacer", height: 14 },
            {
              id: uuid(),
              type: "text",
                content:
                "Les séquences courtes — avant une réunion ou après une longue journée — aident à retrouver un centre sans bruit.",
              fontSize: 14,
              color: "#cbd5e1",
              align: "left" as const,
              fontWeight: "normal" as const,
            },
            { id: uuid(), type: "spacer", height: 14 },
            {
              id: uuid(),
              type: "image",
              src: "https://placehold.co/520x280/fef3c7/92400e",
              alt: "Studio",
              width: 280,
            },
          ],
        },
      ],
      bgColor: "#1a2340",
      paddingTop: 32,
      paddingBottom: 32,
      paddingLeft: 28,
      paddingRight: 28,
      columnGap: 20,
    },
    brandNewsletterLogoStrip(),
  ];

  const canvas4Sections = [
    {
      id: uuid(),
      columns: [
        {
          id: uuid(),
          blocks: [
            {
              id: uuid(),
              type: "hero",
              backgroundImage:
                "https://placehold.co/600x320/312e81/e0e7ff",
              title: "ALYA, À VOTRE RYTHME",
              subtitle: "Inscriptions ouvertes — rejoignez le prochain volet.",
              buttonLabel: "Réserver ma place",
              buttonHref: "https://example.com",
              buttonBgColor: "#ffffff",
              buttonTextColor: "#1a2340",
              overlayColor: "rgba(26,35,64,0.45)",
              textColor: "#ffffff",
              align: "center" as const,
              minHeight: 320,
            },
          ],
        },
      ],
      bgColor: "#1a2340",
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
          verticalAlign: "top" as const,
          blocks: [
            {
              id: uuid(),
              type: "text",
              content: "Le collectif",
              fontSize: 18,
              color: "#ffffff",
              align: "left" as const,
              fontWeight: "bold" as const,
            },
            { id: uuid(), type: "spacer", height: 12 },
            {
              id: uuid(),
              type: "image",
              src: "https://placehold.co/320x200/e2e8f0/1a2340",
              alt: "Collectif",
              width: 180,
            },
            { id: uuid(), type: "spacer", height: 12 },
            {
              id: uuid(),
              type: "text",
              content:
                "Rencontres en petit comité, témoignages et espace d'écoute pour avancer à votre cadence.",
              fontSize: 14,
              color: "#cbd5e1",
              align: "left" as const,
              fontWeight: "normal" as const,
            },
            { id: uuid(), type: "spacer", height: 10 },
            {
              id: uuid(),
              type: "text",
              content:
                "Chaque session laisse du temps aux questions et aux silences utiles.",
              fontSize: 14,
              color: "#cbd5e1",
              align: "left" as const,
              fontWeight: "normal" as const,
            },
            { id: uuid(), type: "spacer", height: 10 },
            {
              id: uuid(),
              type: "text",
              content:
                "Une communauté qui privilégie la profondeur plutôt que le bruit.",
              fontSize: 14,
              color: "#cbd5e1",
              align: "left" as const,
              fontWeight: "normal" as const,
            },
          ],
        },
        {
          id: uuid(),
          verticalAlign: "top" as const,
          blocks: [
            {
              id: uuid(),
              type: "text",
              content: "Ateliers",
              fontSize: 18,
              color: "#ffffff",
              align: "left" as const,
              fontWeight: "bold" as const,
            },
            { id: uuid(), type: "spacer", height: 12 },
            {
              id: uuid(),
              type: "image",
              src: "https://placehold.co/320x200/c7d2fe/312e81",
              alt: "Atelier",
              width: 180,
            },
            { id: uuid(), type: "spacer", height: 12 },
            {
              id: uuid(),
              type: "text",
              content:
                "Formats hybrides : matinées courtes le week-end et soirées en ligne pour les agenda chargés.",
              fontSize: 14,
              color: "#cbd5e1",
              align: "left" as const,
              fontWeight: "normal" as const,
            },
            { id: uuid(), type: "spacer", height: 10 },
            {
              id: uuid(),
              type: "text",
              content:
                "Supports téléchargeables, playlists et fiches réflexes après chaque module.",
              fontSize: 14,
              color: "#cbd5e1",
              align: "left" as const,
              fontWeight: "normal" as const,
            },
            { id: uuid(), type: "spacer", height: 10 },
            {
              id: uuid(),
              type: "text",
              content:
                "Une pédagogie progressive qui respecte les débutantes comme les habituées.",
              fontSize: 14,
              color: "#cbd5e1",
              align: "left" as const,
              fontWeight: "normal" as const,
            },
          ],
        },
        {
          id: uuid(),
          verticalAlign: "top" as const,
          blocks: [
            {
              id: uuid(),
              type: "text",
              content: "Ressources",
              fontSize: 18,
              color: "#ffffff",
              align: "left" as const,
              fontWeight: "bold" as const,
            },
            { id: uuid(), type: "spacer", height: 12 },
            {
              id: uuid(),
              type: "image",
              src: "https://placehold.co/320x200/a7f3d0/065f46",
              alt: "Ressources",
              width: 180,
            },
            { id: uuid(), type: "spacer", height: 12 },
            {
              id: uuid(),
              type: "text",
              content:
                "Bibliothèque audio, carnets imprimables et rappels bienveillants chaque semaine.",
              fontSize: 14,
              color: "#cbd5e1",
              align: "left" as const,
              fontWeight: "normal" as const,
            },
            { id: uuid(), type: "spacer", height: 10 },
            {
              id: uuid(),
              type: "text",
              content:
                "Des contenus pensés pour s'intégrer dans une vraie vie, avec ses imprévus.",
              fontSize: 14,
              color: "#cbd5e1",
              align: "left" as const,
              fontWeight: "normal" as const,
            },
            { id: uuid(), type: "spacer", height: 10 },
            {
              id: uuid(),
              type: "text",
              content:
                "Accès conservé tant que votre inscription est active.",
              fontSize: 14,
              color: "#cbd5e1",
              align: "left" as const,
              fontWeight: "normal" as const,
            },
          ],
        },
      ],
      bgColor: "#1a2340",
      paddingTop: 36,
      paddingBottom: 36,
      paddingLeft: 24,
      paddingRight: 24,
      columnGap: 16,
    },
    {
      id: uuid(),
      columns: [
        {
          id: uuid(),
          blocks: [
            {
              id: uuid(),
              type: "social",
              links: [
                {
                  platform: "instagram" as const,
                  url: "https://instagram.com",
                },
                {
                  platform: "facebook" as const,
                  url: "https://facebook.com",
                },
                {
                  platform: "linkedin" as const,
                  url: "https://linkedin.com",
                },
              ],
              align: "left" as const,
              iconSize: 22,
              iconColor: "#e2e8f0",
            },
          ],
        },
        {
          id: uuid(),
          blocks: [
            {
              id: uuid(),
              type: "button",
              label: "JE M'INSCRIS",
              href: "https://example.com",
              bgColor: "#2563eb",
              textColor: "#ffffff",
              borderRadius: 4,
              align: "center" as const,
            },
          ],
        },
        {
          id: uuid(),
          blocks: [
            {
              id: uuid(),
              type: "text",
              content: "www.alya.fr",
              fontSize: 14,
              color: "#cbd5e1",
              align: "right" as const,
              fontWeight: "normal" as const,
            },
          ],
        },
      ],
      bgColor: "#151d38",
      paddingTop: 28,
      paddingBottom: 28,
      paddingLeft: 24,
      paddingRight: 24,
      columnGap: 12,
    },
    brandNewsletterLogoStrip(),
  ];

  const p1 = uuid();
  const p2 = uuid();
  const p3 = uuid();
  const p4 = uuid();

  return {
    id: uuid(),
    name: "Brand Newsletter",
    pages: [
      {
        id: p1,
        name: "Page 1",
        canvases: [
          {
            id: c1,
            name: "Variant 1",
            x: 0,
            y: 0,
            sections: canvas1Sections,
            globalStyles: gs,
          },
        ],
        activeCanvasId: c1,
      },
      {
        id: p2,
        name: "Page 2",
        canvases: [
          {
            id: c2,
            name: "Variant 1",
            x: 0,
            y: 0,
            sections: articlePageSectionsA,
            globalStyles: gs,
          },
        ],
        activeCanvasId: c2,
      },
      {
        id: p3,
        name: "Page 3",
        canvases: [
          {
            id: c3,
            name: "Variant 1",
            x: 0,
            y: 0,
            sections: articlePageSectionsB,
            globalStyles: gs,
          },
        ],
        activeCanvasId: c3,
      },
      {
        id: p4,
        name: "Page 4",
        canvases: [
          {
            id: c4,
            name: "Variant 1",
            x: 0,
            y: 0,
            sections: canvas4Sections,
            globalStyles: gs,
          },
        ],
        activeCanvasId: c4,
      },
    ],
    activePageId: p1,
  };
}

/** Used for Supabase `category` and for synthetic starter rows merged in the client. */
export const STARTER_TEMPLATE_CATEGORIES: Record<string, string> = {
  Minimal: "newsletter",
  "Product Launch": "marketing",
  "Weekly Digest": "newsletter",
  "Welcome Email": "transactional",
  Promotional: "marketing",
  "Flash Sale": "marketing",
  "Cold Outreach": "outreach",
  "Follow Up": "outreach",
  "Order Confirmation": "transactional",
  "Company Update": "newsletter",
  "Brand Newsletter": "newsletter",
};

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
  makeTemplate(
    "Flash Sale",
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
                content: "⚡ Flash Sale",
                fontSize: 13,
                color: "#ffffff",
                align: "center" as const,
                fontWeight: "normal" as const,
              },
              {
                id: uuid(),
                type: "text",
                content: "24 HOURS ONLY",
                fontSize: 42,
                color: "#ffffff",
                align: "center" as const,
                fontWeight: "bold" as const,
              },
              {
                id: uuid(),
                type: "text",
                content: "Up to 70% off everything",
                fontSize: 18,
                color: "#ffffff",
                align: "center" as const,
                fontWeight: "normal" as const,
              },
              {
                id: uuid(),
                type: "button",
                label: "Shop Now",
                href: "https://example.com",
                bgColor: "#ffffff",
                textColor: "#e11d48",
                borderRadius: 4,
              },
            ],
          },
        ],
        bgColor: "#e11d48",
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
                content:
                  "Sale ends in 24 hours. Don't miss out on these incredible deals.",
                fontSize: 14,
                color: "#555555",
                align: "center" as const,
                fontWeight: "normal" as const,
              },
              { id: uuid(), type: "divider", color: "#eeeeee", thickness: 1 },
              {
                id: uuid(),
                type: "unsubscribe",
                companyName: "Your Company",
                address: "123 Street, City, Country",
                unsubscribeUrl: "https://example.com/unsubscribe",
                textColor: "#aaaaaa",
                fontSize: 11,
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
    { fontFamily: "Inter, sans-serif", bgColor: "#f4f4f4", contentWidth: 600 },
  ),

  makeTemplate(
    "Cold Outreach",
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
                content: "Hi [First Name],",
                fontSize: 16,
                color: "#111111",
                align: "left" as const,
                fontWeight: "normal" as const,
              },
              { id: uuid(), type: "spacer", height: 12 },
              {
                id: uuid(),
                type: "text",
                content:
                  "I came across your work at [Company] and was genuinely impressed by [specific detail]. I'd love to explore how we might be able to help you [achieve goal].",
                fontSize: 16,
                color: "#333333",
                align: "left" as const,
                fontWeight: "normal" as const,
              },
              { id: uuid(), type: "spacer", height: 12 },
              {
                id: uuid(),
                type: "text",
                content:
                  "We help companies like yours [value proposition]. Here's what we've done for similar companies:",
                fontSize: 16,
                color: "#333333",
                align: "left" as const,
                fontWeight: "normal" as const,
              },
              { id: uuid(), type: "spacer", height: 12 },
              {
                id: uuid(),
                type: "text",
                content: "→ [Result 1]\n→ [Result 2]\n→ [Result 3]",
                fontSize: 15,
                color: "#111111",
                align: "left" as const,
                fontWeight: "normal" as const,
              },
              { id: uuid(), type: "spacer", height: 16 },
              {
                id: uuid(),
                type: "text",
                content:
                  "Would you be open to a quick 15-minute call this week?",
                fontSize: 16,
                color: "#111111",
                align: "left" as const,
                fontWeight: "normal" as const,
              },
              { id: uuid(), type: "spacer", height: 16 },
              {
                id: uuid(),
                type: "button",
                label: "Book a call",
                href: "https://example.com/book",
                bgColor: "#111111",
                textColor: "#ffffff",
                borderRadius: 6,
              },
              { id: uuid(), type: "spacer", height: 16 },
              {
                id: uuid(),
                type: "text",
                content: "Best,\n[Your Name]",
                fontSize: 15,
                color: "#333333",
                align: "left" as const,
                fontWeight: "normal" as const,
              },
            ],
          },
        ],
        bgColor: "#ffffff",
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 40,
        paddingRight: 40,
      },
    ],
    { fontFamily: "Inter, sans-serif", bgColor: "#f9f9f9", contentWidth: 560 },
  ),

  makeTemplate(
    "Follow Up",
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
                content: "Following up",
                fontSize: 22,
                color: "#111111",
                align: "left" as const,
                fontWeight: "bold" as const,
              },
              { id: uuid(), type: "spacer", height: 12 },
              {
                id: uuid(),
                type: "text",
                content: "Hi [First Name],",
                fontSize: 16,
                color: "#111111",
                align: "left" as const,
                fontWeight: "normal" as const,
              },
              { id: uuid(), type: "spacer", height: 8 },
              {
                id: uuid(),
                type: "text",
                content:
                  "I wanted to follow up on my previous email about [topic]. I understand you're busy, so I'll keep this brief.",
                fontSize: 16,
                color: "#333333",
                align: "left" as const,
                fontWeight: "normal" as const,
              },
              { id: uuid(), type: "spacer", height: 8 },
              {
                id: uuid(),
                type: "text",
                content:
                  "Is this still something you'd be interested in exploring?",
                fontSize: 16,
                color: "#333333",
                align: "left" as const,
                fontWeight: "normal" as const,
              },
              { id: uuid(), type: "spacer", height: 16 },
              {
                id: uuid(),
                type: "button",
                label: "Schedule a call",
                href: "https://example.com/book",
                bgColor: "#111111",
                textColor: "#ffffff",
                borderRadius: 6,
              },
              { id: uuid(), type: "spacer", height: 16 },
              {
                id: uuid(),
                type: "text",
                content: "Best,\n[Your Name]",
                fontSize: 15,
                color: "#333333",
                align: "left" as const,
                fontWeight: "normal" as const,
              },
            ],
          },
        ],
        bgColor: "#ffffff",
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 40,
        paddingRight: 40,
      },
    ],
    { fontFamily: "Inter, sans-serif", bgColor: "#f9f9f9", contentWidth: 560 },
  ),

  makeTemplate(
    "Order Confirmation",
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
                content: "✓ Order Confirmed",
                fontSize: 24,
                color: "#ffffff",
                align: "center" as const,
                fontWeight: "bold" as const,
              },
              {
                id: uuid(),
                type: "text",
                content: "Thank you for your purchase!",
                fontSize: 14,
                color: "#ffffff",
                align: "center" as const,
                fontWeight: "normal" as const,
              },
            ],
          },
        ],
        bgColor: "#16a34a",
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
                content: "Order #[ORDER_NUMBER]",
                fontSize: 18,
                color: "#111111",
                align: "left" as const,
                fontWeight: "bold" as const,
              },
              { id: uuid(), type: "divider", color: "#eeeeee", thickness: 1 },
              {
                id: uuid(),
                type: "text",
                content: "[Product Name] × 1",
                fontSize: 15,
                color: "#333333",
                align: "left" as const,
                fontWeight: "normal" as const,
              },
              {
                id: uuid(),
                type: "text",
                content: "$[AMOUNT]",
                fontSize: 15,
                color: "#111111",
                align: "left" as const,
                fontWeight: "bold" as const,
              },
              { id: uuid(), type: "divider", color: "#eeeeee", thickness: 1 },
              {
                id: uuid(),
                type: "text",
                content: "Shipping to: [ADDRESS]",
                fontSize: 13,
                color: "#555555",
                align: "left" as const,
                fontWeight: "normal" as const,
              },
              { id: uuid(), type: "spacer", height: 16 },
              {
                id: uuid(),
                type: "button",
                label: "Track your order",
                href: "https://example.com/track",
                bgColor: "#111111",
                textColor: "#ffffff",
                borderRadius: 6,
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
      {
        id: uuid(),
        columns: [
          {
            id: uuid(),
            blocks: [
              {
                id: uuid(),
                type: "unsubscribe",
                companyName: "Your Company",
                address: "123 Street, City, Country",
                unsubscribeUrl: "https://example.com/unsubscribe",
                textColor: "#aaaaaa",
                fontSize: 11,
              },
            ],
          },
        ],
        bgColor: "#f9f9f9",
        paddingTop: 24,
        paddingBottom: 24,
        paddingLeft: 32,
        paddingRight: 32,
      },
    ],
    { fontFamily: "Inter, sans-serif", bgColor: "#f4f4f4", contentWidth: 600 },
  ),

  makeTemplate(
    "Company Update",
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
                content: "[Company Name]",
                fontSize: 20,
                color: "#111111",
                align: "center" as const,
                fontWeight: "bold" as const,
              },
              {
                id: uuid(),
                type: "text",
                content: "Monthly Update — [Month Year]",
                fontSize: 13,
                color: "#666666",
                align: "center" as const,
                fontWeight: "normal" as const,
              },
            ],
          },
        ],
        bgColor: "#ffffff",
        paddingTop: 32,
        paddingBottom: 16,
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
                content: "🚀 What we shipped",
                fontSize: 18,
                color: "#111111",
                align: "left" as const,
                fontWeight: "bold" as const,
              },
              {
                id: uuid(),
                type: "text",
                content:
                  "This month we launched [feature/product]. Here's what it means for you and why we built it.",
                fontSize: 15,
                color: "#444444",
                align: "left" as const,
                fontWeight: "normal" as const,
              },
              { id: uuid(), type: "divider", color: "#eeeeee", thickness: 1 },
              {
                id: uuid(),
                type: "text",
                content: "📊 By the numbers",
                fontSize: 18,
                color: "#111111",
                align: "left" as const,
                fontWeight: "bold" as const,
              },
              {
                id: uuid(),
                type: "text",
                content: "[Key metric 1] • [Key metric 2] • [Key metric 3]",
                fontSize: 15,
                color: "#444444",
                align: "left" as const,
                fontWeight: "normal" as const,
              },
              { id: uuid(), type: "divider", color: "#eeeeee", thickness: 1 },
              {
                id: uuid(),
                type: "text",
                content: "👀 What's coming",
                fontSize: 18,
                color: "#111111",
                align: "left" as const,
                fontWeight: "bold" as const,
              },
              {
                id: uuid(),
                type: "text",
                content:
                  "Next month we're focused on [upcoming feature/goal]. Stay tuned.",
                fontSize: 15,
                color: "#444444",
                align: "left" as const,
                fontWeight: "normal" as const,
              },
              {
                id: uuid(),
                type: "button",
                label: "Read full update",
                href: "https://example.com",
                bgColor: "#111111",
                textColor: "#ffffff",
                borderRadius: 6,
              },
            ],
          },
        ],
        bgColor: "#ffffff",
        paddingTop: 16,
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
                type: "social",
                links: [
                  { platform: "twitter" as const, url: "https://twitter.com" },
                  {
                    platform: "linkedin" as const,
                    url: "https://linkedin.com",
                  },
                ],
                align: "center" as const,
                iconSize: 20,
                iconColor: "#666666",
              },
              {
                id: uuid(),
                type: "unsubscribe",
                companyName: "Your Company",
                address: "123 Street, City, Country",
                unsubscribeUrl: "https://example.com/unsubscribe",
                textColor: "#aaaaaa",
                fontSize: 11,
              },
            ],
          },
        ],
        bgColor: "#f9f9f9",
        paddingTop: 24,
        paddingBottom: 24,
        paddingLeft: 32,
        paddingRight: 32,
      },
    ],
    { fontFamily: "Inter, sans-serif", bgColor: "#f4f4f4", contentWidth: 600 },
  ),
  makeBrandNewsletterTemplate(),
];
