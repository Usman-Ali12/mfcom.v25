import "server-only";
import { createServerSupabaseClient } from "./supabase/server";

// -----------------------------------------------------------------------------
// Brands — Supabase-backed, same pattern as categories-store.ts. Previously
// this was a hardcoded array in lib/mock-data.ts with no admin management.
// Schema: supabase/migrations/0006_brands.sql.
// -----------------------------------------------------------------------------

export type Brand = {
  id: string;
  name: string;
  slug: string;
  position: number;
};

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const SELECT_COLUMNS = "id, name, slug, position";

export async function listBrands(): Promise<Brand[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("brands").select(SELECT_COLUMNS).order("position");
  if (error) throw new Error(`listBrands: ${error.message}`);
  return data as unknown as Brand[];
}

export async function getBrandByName(name: string): Promise<Brand | undefined> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("brands").select(SELECT_COLUMNS).ilike("name", name).maybeSingle();
  if (error) throw new Error(`getBrandByName: ${error.message}`);
  return (data as unknown as Brand) ?? undefined;
}

export async function createBrand(input: { name: string }): Promise<Brand> {
  const supabase = createServerSupabaseClient();

  // Quick-add (from the product form) can race with someone else adding
  // the same brand, or just be re-submitted — treat an existing name as a
  // no-op success rather than a duplicate-key error bubbling up.
  const existing = await getBrandByName(input.name);
  if (existing) return existing;

  const all = await listBrands();
  const id = `brand-${Date.now()}`;
  const row = {
    id,
    name: input.name,
    slug: slugify(input.name),
    position: all.length ? Math.max(...all.map((b) => b.position)) + 1 : 0,
  };
  const { data, error } = await supabase.from("brands").insert(row).select(SELECT_COLUMNS).single();
  if (error) throw new Error(`createBrand: ${error.message}`);
  return data as unknown as Brand;
}

export async function updateBrand(id: string, input: { name: string }): Promise<Brand | undefined> {
  const supabase = createServerSupabaseClient();
  const patch = { name: input.name, slug: slugify(input.name) };
  const { data, error } = await supabase.from("brands").update(patch).eq("id", id).select(SELECT_COLUMNS).maybeSingle();
  if (error) throw new Error(`updateBrand: ${error.message}`);
  return (data as unknown as Brand) ?? undefined;
}

export async function removeBrand(id: string): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  const { error, count } = await supabase.from("brands").delete({ count: "exact" }).eq("id", id);
  if (error) throw new Error(`removeBrand: ${error.message}`);
  return (count ?? 0) > 0;
}
