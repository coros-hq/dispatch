import { supabase } from "./supabase";
import type { Template, Page, Canvas } from "../types";
import { GOOGLE_FONT_PRESETS } from "./google-fonts";
import {
  STARTER_TEMPLATES,
  STARTER_TEMPLATE_CATEGORIES,
} from "./templates";

const defaultInter = GOOGLE_FONT_PRESETS.find((p) => p.id === "inter")!;

export type SavedTemplate = {
  id: string;
  name: string;
  data: Template;
  is_public: boolean;
  is_default: boolean;
  user_id: string | null;
  team_id: string | null;
  category: string;
  created_at: string;
  updated_at: string;
};

function migrateCanvasGlobalStyles(gs: any) {
  const g = { ...(gs ?? {}) };
  if (!g.googleFontCssImportUrl) {
    const fromPreset = GOOGLE_FONT_PRESETS.find(
      (p) => p.fontFamily === g.fontFamily,
    );
    if (fromPreset) g.googleFontCssImportUrl = fromPreset.importUrl;
    else if (
      /^inter\b/i.test(g.fontFamily ?? "") &&
      String(g.fontFamily).toLowerCase().includes("sans-serif")
    ) {
      g.fontFamily = defaultInter.fontFamily;
      g.googleFontCssImportUrl = defaultInter.importUrl;
    }
  }
  return g;
}

function migrateOneCanvas(c: any): Canvas {
  return {
    ...c,
    x: c.x ?? 0,
    y: c.y ?? 0,
    globalStyles: migrateCanvasGlobalStyles(c.globalStyles),
  };
}

function migrateOnePage(p: any): Page {
  const canvases: Canvas[] = (p.canvases ?? []).map(migrateOneCanvas);
  let activeCanvasId = p.activeCanvasId ?? "";
  if (!canvases.some((c) => c.id === activeCanvasId)) {
    activeCanvasId = canvases[0]?.id ?? "";
  }
  return {
    id: p.id ?? crypto.randomUUID(),
    name: p.name ?? "Page 1",
    canvases,
    activeCanvasId,
  };
}

// Migrate old template format to project → pages → canvases
export function migrateTemplate(data: any): Template {
  const id = data.id ?? crypto.randomUUID();
  const name = data.name ?? "Untitled";

  if (data.pages && Array.isArray(data.pages) && data.pages.length > 0) {
    const pages: Page[] = data.pages.map(migrateOnePage);
    let activePageId = data.activePageId ?? "";
    if (!pages.some((p) => p.id === activePageId)) {
      activePageId = pages[0].id;
    }
    return { id, name, pages, activePageId };
  }

  if (data.canvases && Array.isArray(data.canvases)) {
    const canvases: Canvas[] = data.canvases.map(migrateOneCanvas);
    let activeCanvasId = data.activeCanvasId ?? "";
    if (!canvases.some((c) => c.id === activeCanvasId)) {
      activeCanvasId = canvases[0]?.id ?? "";
    }
    const pageId = crypto.randomUUID();
    return {
      id,
      name,
      pages: [
        {
          id: pageId,
          name: "Page 1",
          canvases,
          activeCanvasId,
        },
      ],
      activePageId: pageId,
    };
  }

  // Old format — sections on root, wrap in canvas + page
  const rawGs = data.globalStyles ?? {};
  const fromPreset = GOOGLE_FONT_PRESETS.find(
    (p) => p.fontFamily === rawGs.fontFamily,
  );
  const globalStyles = {
    fontFamily: rawGs.fontFamily ?? defaultInter.fontFamily,
    googleFontCssImportUrl:
      rawGs.googleFontCssImportUrl ??
      fromPreset?.importUrl ??
      (/^inter\b/i.test(rawGs.fontFamily ?? "") &&
      String(rawGs.fontFamily).toLowerCase().includes("sans-serif")
        ? defaultInter.importUrl
        : undefined),
    bgColor: rawGs.bgColor ?? "#f4f4f4",
    contentWidth: rawGs.contentWidth ?? 600,
  };
  const canvas = {
    id: crypto.randomUUID(),
    name: "Variant 1",
    x: 0,
    y: 0,
    sections: data.sections ?? [],
    globalStyles,
  };
  const pageId = crypto.randomUUID();
  return {
    id,
    name,
    pages: [
      {
        id: pageId,
        name: "Page 1",
        canvases: [canvas],
        activeCanvasId: canvas.id,
      },
    ],
    activePageId: pageId,
  };
}

function starterSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "template"
  );
}

/** Local starter row when the DB was seeded before this template existed. */
function starterFromCode(template: Template): SavedTemplate {
  return {
    id: `code-starter-${starterSlug(template.name)}`,
    name: template.name,
    data: migrateTemplate(template),
    is_public: true,
    is_default: true,
    user_id: null,
    team_id: null,
    category: STARTER_TEMPLATE_CATEGORIES[template.name] ?? "general",
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  };
}

export function mergeDefaultTemplatesWithCode(
  dbDefaults: SavedTemplate[],
): SavedTemplate[] {
  const byName = new Map(dbDefaults.map((d) => [d.name, d]));
  const merged: SavedTemplate[] = [];
  const seenFromCodeList = new Set<string>();

  for (const t of STARTER_TEMPLATES) {
    const fromDb = byName.get(t.name);
    if (fromDb) {
      merged.push({
        ...fromDb,
        data: migrateTemplate(fromDb.data),
      });
    } else {
      merged.push(starterFromCode(t));
    }
    seenFromCodeList.add(t.name);
  }

  for (const d of dbDefaults) {
    if (!seenFromCodeList.has(d.name)) {
      merged.push({
        ...d,
        data: migrateTemplate(d.data),
      });
    }
  }

  return merged;
}

// Fetch all templates available to the user
// (own templates + public templates + default templates)
export async function fetchTemplates(
  search?: string,
): Promise<SavedTemplate[]> {
  let query = supabase
    .from("templates")
    .select("*")
    .order("created_at", { ascending: false });

  if (search && search.trim()) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  const migrated = (data as SavedTemplate[]).map((t) => ({
    ...t,
    data: migrateTemplate(t.data),
  }));

  const dbDefaults = migrated.filter((t) => t.is_default);
  const rest = migrated.filter((t) => !t.is_default);
  const mergedDefaults = mergeDefaultTemplatesWithCode(dbDefaults);

  const searchTrim = search?.trim().toLowerCase();
  let combined = [...mergedDefaults, ...rest];
  if (searchTrim) {
    combined = combined.filter((t) =>
      t.name.toLowerCase().includes(searchTrim),
    );
  }
  return combined;
}

export async function saveTemplate(
  template: Template,
  isPublic: boolean,
  category: string = "general",
  teamId?: string | null,
): Promise<SavedTemplate> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("templates")
    .insert({
      name: template.name,
      data: template,
      is_public: isPublic,
      is_default: false,
      user_id: user.id,
      team_id: teamId ?? null,
      category,
    })
    .select()
    .single();

  if (error) throw error;
  return data as SavedTemplate;
}

export async function updateTemplate(
  id: string,
  template: Template,
  isPublic: boolean,
  category?: string,
): Promise<SavedTemplate> {
  const updates: any = {
    name: template.name,
    data: template,
    is_public: isPublic,
    updated_at: new Date().toISOString(),
  };
  if (category) updates.category = category;

  const { data, error } = await supabase
    .from("templates")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as SavedTemplate;
}

// Delete a template
export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase.from("templates").delete().eq("id", id);

  if (error) throw error;
}

export async function renameTemplate(id: string, name: string): Promise<void> {
  const { error } = await supabase
    .from("templates")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function fetchPublicTemplates(
  category?: string,
): Promise<SavedTemplate[]> {
  const query = supabase
    .from("templates")
    .select("*")
    .or("is_default.eq.true,is_public.eq.true")
    .order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  const migrated = (data as SavedTemplate[]).map((t) => ({
    ...t,
    data: migrateTemplate(t.data),
  }));

  const dbDefaults = migrated.filter((t) => t.is_default);
  const rest = migrated.filter((t) => !t.is_default);
  const mergedDefaults = mergeDefaultTemplatesWithCode(dbDefaults);

  let combined = [...mergedDefaults, ...rest];
  if (category && category !== "all") {
    combined = combined.filter((t) => t.category === category);
  }
  return combined;
}
