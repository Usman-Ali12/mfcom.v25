import "server-only";
import { createServerSupabaseClient } from "./supabase/server";
import type { Product } from "./mock-data";

// -----------------------------------------------------------------------------
// Products — Supabase-backed (Postgres). This replaces the earlier
// JSON-file-backed version. Same exported function names as before
// (listProducts/getProductById/createProduct/updateProduct/removeProduct/
// slugify), so this is the last time this file's public shape needs to
// change — but every function is now genuinely async, since a real
// database query can't be synchronous the way a file read could fake
// being. Every call site was updated to `await` these.
//
// Schema: supabase/migrations/0001_products.sql — run that once in the
// Supabase SQL Editor before this file will do anything useful.
// -----------------------------------------------------------------------------

type ProductRow = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  short_spec: string | null;
  description: string;
  price: number;
  previous_price: number | null;
  currency: string;
  stock: Product["stock"];
  stock_count: number;
  rating: number;
  review_count: number;
  image: string;
  gallery: string[];
  specifications: { label: string; value: string }[];
  warranty: string | null;
  badge: string | null;
};

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    brand: row.brand,
    category: row.category,
    shortSpec: row.short_spec ?? "",
    description: row.description,
    price: row.price,
    previousPrice: row.previous_price ?? undefined,
    currency: (row.currency as "PKR") ?? "PKR",
    stock: row.stock,
    stockCount: row.stock_count,
    rating: row.rating,
    reviewCount: row.review_count,
    image: row.image,
    gallery: row.gallery ?? [],
    specifications: row.specifications ?? [],
    warranty: row.warranty ?? "",
    badge: (row.badge as Product["badge"]) ?? undefined,
  };
}

function productToRow(input: Partial<Product>) {
  const row: Record<string, unknown> = {};
  if (input.slug !== undefined) row.slug = input.slug;
  if (input.sku !== undefined) row.sku = input.sku;
  if (input.name !== undefined) row.name = input.name;
  if (input.brand !== undefined) row.brand = input.brand;
  if (input.category !== undefined) row.category = input.category;
  if (input.shortSpec !== undefined) row.short_spec = input.shortSpec;
  if (input.description !== undefined) row.description = input.description;
  if (input.price !== undefined) row.price = input.price;
  if (input.previousPrice !== undefined) row.previous_price = input.previousPrice ?? null;
  if (input.currency !== undefined) row.currency = input.currency;
  if (input.stock !== undefined) row.stock = input.stock;
  if (input.stockCount !== undefined) row.stock_count = input.stockCount;
  if (input.rating !== undefined) row.rating = input.rating;
  if (input.reviewCount !== undefined) row.review_count = input.reviewCount;
  if (input.image !== undefined) row.image = input.image;
  if (input.gallery !== undefined) row.gallery = input.gallery;
  if (input.specifications !== undefined) row.specifications = input.specifications;
  if (input.warranty !== undefined) row.warranty = input.warranty;
  if (input.badge !== undefined) row.badge = input.badge ?? null;
  return row;
}

export async function listProducts(): Promise<Product[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(`listProducts: ${error.message}`);
  return (data as ProductRow[]).map(rowToProduct);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`getProductById: ${error.message}`);
  return data ? rowToProduct(data as ProductRow) : undefined;
}

export async function createProduct(input: Omit<Product, "id">): Promise<Product> {
  const supabase = createServerSupabaseClient();
  const id = `p${Date.now()}`;
  const row = { id, ...productToRow(input) };
  const { data, error } = await supabase.from("products").insert(row).select().single();
  if (error) throw new Error(`createProduct: ${error.message}`);
  return rowToProduct(data as ProductRow);
}

export async function updateProduct(id: string, input: Partial<Product>): Promise<Product | undefined> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .update(productToRow(input))
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw new Error(`updateProduct: ${error.message}`);
  return data ? rowToProduct(data as ProductRow) : undefined;
}

export async function removeProduct(id: string): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  const { error, count } = await supabase.from("products").delete({ count: "exact" }).eq("id", id);
  if (error) throw new Error(`removeProduct: ${error.message}`);
  return (count ?? 0) > 0;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
