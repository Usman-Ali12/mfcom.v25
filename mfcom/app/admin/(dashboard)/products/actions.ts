"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createProduct, updateProduct, removeProduct, slugify } from "@/lib/admin-store";
import { createBrand, getBrandByName } from "@/lib/brands-store";
import { createCategory, listCategories } from "@/lib/categories-store";
import type { Product } from "@/lib/mock-data";

const NEW_VALUE = "__new__";

// Resolves the "+ Add new brand/category…" sentinel from ProductForm into
// a real, persisted brand/category name, creating it first if needed.
// Falls through untouched for the normal (already-selected) case.
async function resolveBrand(formData: FormData): Promise<string> {
  const brand = String(formData.get("brand") || "");
  if (brand !== NEW_VALUE) return brand;
  const newName = String(formData.get("newBrandName") || "").trim();
  if (!newName) return "";
  const existing = await getBrandByName(newName);
  if (existing) return existing.name;
  const created = await createBrand({ name: newName });
  return created.name;
}

async function resolveCategory(formData: FormData): Promise<string> {
  const category = String(formData.get("category") || "");
  if (category !== NEW_VALUE) return category;
  const newName = String(formData.get("newCategoryName") || "").trim();
  if (!newName) return "";
  const existing = (await listCategories()).find((c) => c.name.toLowerCase() === newName.toLowerCase());
  if (existing) return existing.name;
  const created = await createCategory({ name: newName, group: "Other" });
  return created.name;
}

async function readProductForm(formData: FormData): Promise<Omit<Product, "id">> {
  const name = String(formData.get("name") || "");
  const price = Number(formData.get("price") || 0);
  const previousPriceRaw = String(formData.get("previousPrice") || "");
  const image = String(formData.get("image") || "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80");

  const specLabels = formData.getAll("specLabel") as string[];
  const specValues = formData.getAll("specValue") as string[];
  const specifications = specLabels
    .map((label, i) => ({ label: label.trim(), value: (specValues[i] || "").trim() }))
    .filter((s) => s.label && s.value);

  const [brand, category] = await Promise.all([resolveBrand(formData), resolveCategory(formData)]);

  return {
    name,
    slug: slugify(name),
    sku: String(formData.get("sku") || slugify(name).toUpperCase()),
    brand,
    category,
    shortSpec: String(formData.get("shortSpec") || ""),
    description: String(formData.get("description") || ""),
    price,
    previousPrice: previousPriceRaw ? Number(previousPriceRaw) : undefined,
    currency: "PKR",
    stock:
      (String(formData.get("stock") || "in-stock") as Product["stock"]) ?? "in-stock",
    stockCount: Number(formData.get("stockCount") || 0),
    rating: Number(formData.get("rating") || 4.5),
    reviewCount: Number(formData.get("reviewCount") || 0),
    image,
    gallery: [image],
    specifications,
    warranty: String(formData.get("warranty") || "1-year manufacturer warranty"),
    badge: (formData.get("badge") as Product["badge"]) || undefined,
    condition: (formData.get("condition") as Product["condition"]) || "new",
  };
}

export async function createProductAction(formData: FormData) {
  const input = await readProductForm(formData);
  await createProduct(input);
  revalidatePath("/admin/products");
  revalidatePath("/admin/brands");
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  redirect(`/admin/products?toast=${encodeURIComponent(`"${input.name}" created`)}`);
}

export async function updateProductAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const input = await readProductForm(formData);
  await updateProduct(id, input);
  revalidatePath("/admin/products");
  revalidatePath("/admin/brands");
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath(`/product/${input.slug}`);
  redirect(`/admin/products?toast=${encodeURIComponent(`"${input.name}" saved`)}`);
}

export async function deleteProductAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  await removeProduct(id);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect(`/admin/products?toast=${encodeURIComponent("Product deleted")}&toastType=info`);
}

// --- Bulk actions — mainly for cleaning up a large CSV import: e.g. select
// every row that landed in "Uncategorized" and move them to a real category
// in one action instead of opening each product individually. Invoked
// directly from the client's onClick (not a <form action>), since the
// selection is arbitrary client-side state, not a single form's fields.
// Returns a result rather than redirecting, so the caller can show which
// specific rows failed instead of losing that detail on navigation.

export async function bulkUpdateCategoryAction(
  ids: string[],
  categoryName: string
): Promise<{ success: number; failed: string[] }> {
  let success = 0;
  const failed: string[] = [];
  for (const id of ids) {
    try {
      await updateProduct(id, { category: categoryName });
      success++;
    } catch {
      failed.push(id);
    }
  }
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success, failed };
}

export async function bulkUpdateConditionAction(
  ids: string[],
  condition: "new" | "used"
): Promise<{ success: number; failed: string[] }> {
  let success = 0;
  const failed: string[] = [];
  for (const id of ids) {
    try {
      await updateProduct(id, { condition });
      success++;
    } catch {
      failed.push(id);
    }
  }
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success, failed };
}

export async function bulkDeleteAction(ids: string[]): Promise<{ success: number; failed: string[] }> {
  let success = 0;
  const failed: string[] = [];
  for (const id of ids) {
    try {
      await removeProduct(id);
      success++;
    } catch {
      failed.push(id);
    }
  }
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success, failed };
}
