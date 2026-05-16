import { supabase } from "./supabase";
import type { Template } from "../types";

export type ProjectVersion = {
  id: string;
  template_id: string;
  data: Template;
  label: string | null;
  created_by: string;
  created_at: string;
};

export async function saveVersion(
  templateId: string,
  data: Template,
  label?: string,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("project_versions").insert({
    template_id: templateId,
    data,
    label: label ?? null,
    created_by: user.id,
  });

  const { data: versions } = await supabase
    .from("project_versions")
    .select("id")
    .eq("template_id", templateId)
    .order("created_at", { ascending: false });

  if (versions && versions.length > 10) {
    const toDelete = versions.slice(10).map((v) => v.id);
    await supabase.from("project_versions").delete().in("id", toDelete);
  }
}

export async function fetchVersions(
  templateId: string,
): Promise<ProjectVersion[]> {
  const { data, error } = await supabase
    .from("project_versions")
    .select("*")
    .eq("template_id", templateId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ProjectVersion[];
}

export async function labelVersion(
  versionId: string,
  label: string,
): Promise<void> {
  const { error } = await supabase
    .from("project_versions")
    .update({ label })
    .eq("id", versionId);
  if (error) throw error;
}

export async function deleteVersion(versionId: string): Promise<void> {
  const { error } = await supabase
    .from("project_versions")
    .delete()
    .eq("id", versionId);
  if (error) throw error;
}
