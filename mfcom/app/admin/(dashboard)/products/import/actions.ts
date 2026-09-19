"use server";

import { revalidatePath } from "next/cache";
import { createProduct, slugify } from "@/lib/admin-store";
import { getBrandByName, createBrand } from "@/lib/brands-store";
import { listCategories, createCategory, getCategoryBySlug } from "@/lib/categories-store";
import type { Product } from "@/lib/mock-data";

export type ConfirmImportRow = {
  name: string;
  brand: string;
  categorySlug: string; // existing category slug, OR the raw text of a brand-new category name
  isNewCategory: boolean;
  condition: "new" | "used";
  price: number;
  currency: string;
  description: string;
  imageUrl: string;
};

async function resolveBrandName(name: string): Promise<string> {
  const trimmed = name.trim();
  if (!trimmed) return "";
  const existing = await getBrandByName(trimmed);
  if (existing) return existing.name;
  const created = await createBrand({ name: trimmed });
  return created.name;
}

async function resolveCategoryName(row: ConfirmImportRow): Promise<string> {
  if (row.isNewCategory) {
    const newName = row.categorySlug.trim();
    if (!newName) return "";
    const existing = (await listCategories()).find((c) => c.name.toLowerCase() === newName.toLowerCase());
    if (existing) return existing.name;
    // "Other" is a reasonable default group for whatever a scraped catalog
    // needed a brand-new category for — the client can move it under
    // Admin > Categories afterward same as any manually-created category.
    const created = await createCategory({ name: newName, group: "Other" });
    return created.name;
  }
  const category = await getCategoryBySlug(row.categorySlug);
  return category?.name ?? "";
}

// SKUs need to be unique-ish and human-scannable; slugify+timestamp mirrors
// what the manual product form falls back to when no SKU is typed in.
function makeSku(name: string, sourceOrder: number): string {
  return `${slugify(name).toUpperCase().slice(0, 20)}-${Date.now().toString().slice(-5)}${sourceOrder}`;
}

export async function confirmCatalogImportAction(
  rows: ConfirmImportRow[]
): Promise<{ imported: number; failed: { name: string; error: string }[] }> {
  let imported = 0;
  const failed: { name: string; error: string }[] = [];

  // Sequential, not Promise.all: createProduct mints its id from Date.now(),
  // so parallel inserts risk colliding on the same millisecond. A batch
  // like this (tens to low hundreds of rows) finishing a beat slower is a
  // fine trade for not silently dropping a product to an id collision.
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const [brand, category] = await Promise.all([resolveBrandName(row.brand), resolveCategoryName(row)]);

      const input: Omit<Product, "id"> = {
        name: row.name,
        slug: slugify(row.name),
        sku: makeSku(row.name, i),
        brand,
        category,
        shortSpec: "",
        description: row.description || row.name,
        price: row.price,
        currency: (row.currency as Product["currency"]) || "PKR",
        stock: "in-stock",
        stockCount: 10,
        rating: 0,
        reviewCount: 0,
        image: row.imageUrl,
        gallery: row.imageUrl ? [row.imageUrl] : [],
        specifications: [],
        warranty: "1-year manufacturer warranty",
        condition: row.condition,
      };

      await createProduct(input);
      imported++;
    } catch (e) {
      failed.push({ name: row.name, error: e instanceof Error ? e.message : "Unknown error" });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/brands");
  revalidatePath("/admin/categories");
  revalidatePath("/shop");

  return { imported, failed };
}
