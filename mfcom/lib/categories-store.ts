import "server-only";
import { createServerSupabaseClient } from "./supabase/server";

// -----------------------------------------------------------------------------
// Categories — Supabase-backed. Same async-function-name-preserved pattern
// as admin-store.ts's products migration: every consuming file was updated
// to await these. Schema: supabase/migrations/0002_categories.sql.
// -----------------------------------------------------------------------------

export type Category = {
  id: string;
  name: string;
  slug: string;
  group: string;
  position: number;
};

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// PostgREST's select syntax is its own DSL, not raw SQL — "group" doesn't
// need quoting here the way it would in a literal SQL statement.
const SELECT_COLUMNS = "id, name, slug, group, position";

export async function listCategories(): Promise<Category[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("categories").select(SELECT_COLUMNS).order("position");
  if (error) throw new Error(`listCategories: ${error.message}`);
  return data as unknown as Category[];
}

export async function listCategoryGroups(): Promise<{ group: string; items: string[] }[]> {
  const all = await listCategories();
  const groups = new Map<string, string[]>();
  for (const c of all) {
    if (!groups.has(c.group)) groups.set(c.group, []);
    groups.get(c.group)!.push(c.name);
  }
  return Array.from(groups.entries()).map(([group, items]) => ({ group, items }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("categories").select(SELECT_COLUMNS).eq("slug", slug).maybeSingle();
  if (error) throw new Error(`getCategoryBySlug: ${error.message}`);
  return (data as unknown as Category) ?? undefined;
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("categories").select(SELECT_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw new Error(`getCategoryById: ${error.message}`);
  return (data as unknown as Category) ?? undefined;
}

export async function createCategory(input: { name: string; group: string }): Promise<Category> {
  const supabase = createServerSupabaseClient();
  const all = await listCategories();
  const id = `cat-${Date.now()}`;
  const row = {
    id,
    name: input.name,
    slug: slugify(input.name),
    group: input.group,
    position: all.length ? Math.max(...all.map((c) => c.position)) + 1 : 0,
  };
  const { data, error } = await supabase
    .from("categories")
    .insert({ id: row.id, name: row.name, slug: row.slug, group: row.group, position: row.position })
    .select(SELECT_COLUMNS)
    .single();
  if (error) throw new Error(`createCategory: ${error.message}`);
  return data as unknown as Category;
}

export async function updateCategory(
  id: string,
  input: Partial<Pick<Category, "name" | "group">>
): Promise<Category | undefined> {
  const supabase = createServerSupabaseClient();
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) {
    patch.name = input.name;
    patch.slug = slugify(input.name);
  }
  if (input.group !== undefined) patch.group = input.group;

  const { data, error } = await supabase.from("categories").update(patch).eq("id", id).select(SELECT_COLUMNS).maybeSingle();
  if (error) throw new Error(`updateCategory: ${error.message}`);
  return (data as unknown as Category) ?? undefined;
}

export async function removeCategory(id: string): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  const { error, count } = await supabase.from("categories").delete({ count: "exact" }).eq("id", id);
  if (error) throw new Error(`removeCategory: ${error.message}`);
  return (count ?? 0) > 0;
}
