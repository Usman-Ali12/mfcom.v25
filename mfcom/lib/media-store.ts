import "server-only";
import { createServerSupabaseClient } from "./supabase/server";

// -----------------------------------------------------------------------------
// Media library — Supabase Storage for the actual file bytes, Postgres for
// the metadata (mirrors every other *-store.ts in this app). Previously
// this wrote to local disk (.data/uploads + a .data/media.json index),
// which works on a persistent server but not on Vercel: the filesystem
// there is ephemeral/read-only at runtime, so uploads either failed
// outright or vanished on the next deploy.
//
// Schema + bucket: supabase/migrations/0007_media.sql.
// -----------------------------------------------------------------------------

export type MediaItem = {
  id: string;
  filename: string;
  url: string;
  size: number;
  uploadedAt: string;
};

const BUCKET = "media";

type MediaRow = {
  id: string;
  filename: string;
  storage_path: string;
  url: string;
  size: number;
  uploaded_at: string;
};

function toMediaItem(row: MediaRow): MediaItem {
  return { id: row.id, filename: row.filename, url: row.url, size: row.size, uploadedAt: row.uploaded_at };
}

export async function listMedia(): Promise<MediaItem[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("media_items")
    .select("id, filename, storage_path, url, size, uploaded_at")
    .order("uploaded_at", { ascending: false });
  if (error) throw new Error(`listMedia: ${error.message}`);
  return (data as unknown as MediaRow[]).map(toMediaItem);
}

// Does the actual upload — bytes to Storage, then a metadata row — and
// returns the finished record. The API route (app/api/upload/route.ts)
// only handles the HTTP/validation layer; this is the one place that
// knows how a file actually gets stored.
export async function uploadMedia(file: File): Promise<MediaItem> {
  const supabase = createServerSupabaseClient();

  const ext = file.name.includes(".") ? file.name.split(".").pop() : file.type.split("/")[1];
  const storagePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const bytes = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, { contentType: file.type, upsert: false });
  if (uploadError) throw new Error(`uploadMedia (storage): ${uploadError.message}`);

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  const row = {
    id: `media${Date.now()}`,
    filename: file.name,
    storage_path: storagePath,
    url: publicUrlData.publicUrl,
    size: file.size,
  };
  const { data, error } = await supabase
    .from("media_items")
    .insert(row)
    .select("id, filename, storage_path, url, size, uploaded_at")
    .single();
  if (error) {
    // Metadata row failed after the blob was already written — clean up
    // the orphaned file rather than leaving storage and the DB out of sync.
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw new Error(`uploadMedia (metadata): ${error.message}`);
  }
  return toMediaItem(data as unknown as MediaRow);
}

export async function removeMedia(id: string): Promise<boolean> {
  const supabase = createServerSupabaseClient();

  const { data: existing } = await supabase
    .from("media_items")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  const { error, count } = await supabase.from("media_items").delete({ count: "exact" }).eq("id", id);
  if (error) throw new Error(`removeMedia: ${error.message}`);

  if (existing?.storage_path) {
    // Metadata is gone either way — a failed blob delete just leaves an
    // orphaned file in the bucket, not a broken product image.
    await supabase.storage.from(BUCKET).remove([existing.storage_path]).catch(() => {});
  }

  return (count ?? 0) > 0;
}
