"use server";

import { revalidatePath } from "next/cache";
import { createProduct, slugify, listProducts } from "@/lib/admin-store";
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
  images: string[];
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
    // "Accessories" rather than "Other" as the default group for a brand
    // new category — "Other" as a customer-facing group/name is exactly
    // the genericness this consolidation was meant to get rid of; better
    // to land somewhere reasonable by default and let the admin move it
    // under Admin > Categories if it deserves its own group.
    const created = await createCategory({ name: newName, group: "Accessories" });
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
): Promise<{ imported: number; skipped: number; failed: { name: string; error: string }[] }> {
  let imported = 0;
  let skipped = 0;
  const failed: { name: string; error: string }[] = [];

  // Re-running an import (e.g. after fixing a failed batch) used to create
  // a brand-new duplicate product for every row, every time — including
  // for rows that already imported successfully earlier. Any edits made
  // to the first copy would then sit right next to an untouched
  // duplicate, which is exactly what "my edit reverted" looks like from
  // the storefront if the duplicate happens to be the one showing. Skips
  // a row outright if a product with the same slug already exists,
  // rather than re-creating it.
  const existingSlugs = new Set((await listProducts()).map((p) => p.slug));

  // Sequential, not Promise.all: createProduct mints its id from Date.now(),
  // so parallel inserts risk colliding on the same millisecond. A batch
  // like this (tens to low hundreds of rows) finishing a beat slower is a
  // fine trade for not silently dropping a product to an id collision.
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const slug = slugify(row.name);
    if (existingSlugs.has(slug)) {
      skipped++;
      continue;
    }
    try {
      const [brand, category] = await Promise.all([resolveBrandName(row.brand), resolveCategoryName(row)]);

      const description = row.description || row.name;
      const input: Omit<Product, "id"> = {
        name: row.name,
        slug,
        sku: makeSku(row.name, i),
        brand,
        category,
        // Was always blank — left every imported card with a visible empty
        // line where a spec/description snippet belongs (ProductCard has
        // a description fallback now too, but storing a real value here
        // means the actual data is meaningful, not just the display).
        shortSpec: description.slice(0, 70),
        description,
        price: row.price,
        currency: (row.currency as Product["currency"]) || "PKR",
        stock: "in-stock",
        stockCount: 10,
        rating: 0,
        reviewCount: 0,
        image: row.images[0] || "",
        gallery: row.images,
        specifications: [],
        // Not "1-year manufacturer warranty" — that was a guess with
        // nothing behind it for a scraped WhatsApp listing. Better to show
        // "Not specified" (see the Specifications fallback) until an admin
        // actually confirms real terms per product.
        warranty: "",
        condition: row.condition,
      };

      await createProduct(input);
      existingSlugs.add(slug);
      imported++;
    } catch (e) {
      failed.push({ name: row.name, error: e instanceof Error ? e.message : "Unknown error" });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/brands");
  revalidatePath("/admin/categories");
  revalidatePath("/shop");

  return { imported, skipped, failed };
}
