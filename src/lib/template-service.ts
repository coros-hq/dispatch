import { supabase } from "./supabase";
import type { Template, Canvas } from "../types";
import { v4 as uuid } from "uuid";

export type SavedTemplate = {
  id: string;
  name: string;
  data: Template;
  is_public: boolean;
  is_default: boolean;
  user_id: string | null;
  category: string;
  created_at: string;
  updated_at: string;
};

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

  // Migrate old format templates
  return (data as SavedTemplate[]).map((t) => ({
    ...t,
    data: migrateTemplate(t.data),
  }));
}

export async function saveTemplate(
  template: Template,
  isPublic: boolean,
  category: string = "general",
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

// Migrate old template format to new canvas-based format
export function migrateTemplate(data: any): Template {
  // Already new format
  if (data.canvases) return data as Template;

  // Old format — wrap sections and globalStyles into a single canvas
  const canvas: Canvas = {
    id: uuid(),
    name: "Canvas 1",
    sections: data.sections ?? [],
    globalStyles: data.globalStyles ?? {
      fontFamily: "Inter, sans-serif",
      bgColor: "#f4f4f4",
      contentWidth: 600,
    },
  };

  return {
    id: data.id ?? uuid(),
    name: data.name ?? "Untitled",
    canvases: [canvas],
    activeCanvasId: canvas.id,
  };
}

export async function fetchPublicTemplates(
  category?: string,
): Promise<SavedTemplate[]> {
  let query = supabase
    .from("templates")
    .select("*")
    .or("is_default.eq.true,is_public.eq.true")
    .order("created_at", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data as SavedTemplate[]).map((t) => ({
    ...t,
    data: migrateTemplate(t.data),
  }));
}
