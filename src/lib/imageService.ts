import { PLAN_LIMITS, type Plan } from "./planLimits";
import { supabase } from "./supabase";

export type UploadedImage = {
  url: string;
  path: string;
  size: number;
  type: string;
};

export async function uploadImage(
  file: File,
  plan: Plan,
): Promise<UploadedImage> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const limits = PLAN_LIMITS[plan];

  const maxSize = limits.maxImageSizeMb * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(
      `Image must be under ${limits.maxImageSizeMb}MB${plan === "free" ? " — upgrade to Pro for 5MB limit" : ""}`,
    );
  }

  if (plan === "free") {
    const existing = await fetchUserImages();
    if (existing.length >= limits.maxImageUploads) {
      throw new Error(
        `Free plan includes ${limits.maxImageUploads} image uploads. Upgrade to Pro for unlimited.`,
      );
    }
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type))
    throw new Error("Only JPG, PNG, WebP and GIF are supported");

  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `${user.id}/${fileName}`;

  const { error } = await supabase.storage.from("images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("images").getPublicUrl(path);

  return {
    url: data.publicUrl,
    path,
    size: file.size,
    type: file.type,
  };
}

export async function deleteImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from("images").remove([path]);
  if (error) throw error;
}

export async function fetchUserImages(): Promise<UploadedImage[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.storage
    .from("images")
    .list(user.id, {
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) throw error;

  return (data ?? []).map((entry) => {
    const relativePath = `${user.id}/${entry.name}`;
    const { data: pub } = supabase.storage
      .from("images")
      .getPublicUrl(relativePath);

    const meta = entry.metadata as
      | { size?: number; mimetype?: string }
      | null
      | undefined;

    return {
      url: pub.publicUrl,
      path: relativePath,
      size: meta?.size ?? 0,
      type: meta?.mimetype ?? "image/jpeg",
    };
  });
}
