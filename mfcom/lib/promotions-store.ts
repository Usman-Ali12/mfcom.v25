import "server-only";
import { createServerSupabaseClient } from "./supabase/server";

// -----------------------------------------------------------------------------
// Promotions — Supabase-backed. Same async-preserved-names pattern as the
// products/categories/settings migrations. Schema:
// supabase/migrations/0004_promotions.sql.
//
// "Live" for a promotion means BOTH the admin's `active` toggle is on AND
// the current time falls within [startDate, endDate] — matching the
// brief's requirement that countdowns use real dates, not a flag alone,
// and that an expired promotion stops showing itself automatically.
// -----------------------------------------------------------------------------

export type Promotion = {
  id: string;
  name: string;
  title: string;
  message: string;
  startDate: string; // ISO
  endDate: string; // ISO
  productSlugs: string[];
  active: boolean;
};

type PromotionRow = {
  id: string;
  name: string;
  title: string;
  message: string;
  start_date: string;
  end_date: string;
  product_slugs: string[];
  active: boolean;
};

function rowToPromotion(row: PromotionRow): Promotion {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    message: row.message,
    startDate: row.start_date,
    endDate: row.end_date,
    productSlugs: row.product_slugs ?? [],
    active: row.active,
  };
}

function promotionToRow(input: Partial<Promotion>) {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.title !== undefined) row.title = input.title;
  if (input.message !== undefined) row.message = input.message;
  if (input.startDate !== undefined) row.start_date = input.startDate;
  if (input.endDate !== undefined) row.end_date = input.endDate;
  if (input.productSlugs !== undefined) row.product_slugs = input.productSlugs;
  if (input.active !== undefined) row.active = input.active;
  return row;
}

export async function listPromotions(): Promise<Promotion[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("listPromotions: falling back to empty list —", error.message);
    return [];
  }
  return (data as PromotionRow[]).map(rowToPromotion);
}

export async function getPromotionById(id: string): Promise<Promotion | undefined> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("promotions").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`getPromotionById: ${error.message}`);
  return data ? rowToPromotion(data as PromotionRow) : undefined;
}

/** The promotion currently live to shoppers, if any — active flag AND within its date range. */
export async function getActivePromotion(): Promise<Promotion | undefined> {
  const now = new Date().toISOString();
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("active", true)
    .lte("start_date", now)
    .gte("end_date", now)
    .limit(1)
    .maybeSingle();
  if (error) {
    // Never let a promotions-table hiccup take down the homepage — no
    // active promotion is a perfectly safe fallback state.
    console.error("getActivePromotion: falling back to none —", error.message);
    return undefined;
  }
  return data ? rowToPromotion(data as PromotionRow) : undefined;
}

export async function createPromotion(input: Omit<Promotion, "id">): Promise<Promotion> {
  const supabase = createServerSupabaseClient();
  const id = `promo${Date.now()}`;
  const row = { id, ...promotionToRow(input) };
  const { data, error } = await supabase.from("promotions").insert(row).select().single();
  if (error) throw new Error(`createPromotion: ${error.message}`);
  return rowToPromotion(data as PromotionRow);
}

export async function updatePromotion(id: string, input: Partial<Promotion>): Promise<Promotion | undefined> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("promotions")
    .update(promotionToRow(input))
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw new Error(`updatePromotion: ${error.message}`);
  return data ? rowToPromotion(data as PromotionRow) : undefined;
}

export async function removePromotion(id: string): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  const { error, count } = await supabase.from("promotions").delete({ count: "exact" }).eq("id", id);
  if (error) throw new Error(`removePromotion: ${error.message}`);
  return (count ?? 0) > 0;
}
