"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createBrand, updateBrand, removeBrand } from "@/lib/brands-store";

export async function createBrandAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (name) await createBrand({ name });
  revalidatePath("/admin/brands");
  revalidatePath("/admin/products/new");
  redirect(`/admin/brands?toast=${encodeURIComponent(name ? `"${name}" added` : "Brand added")}`);
}

export async function updateBrandAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (id && name) await updateBrand(id, { name });
  revalidatePath("/admin/brands");
  redirect(`/admin/brands?toast=${encodeURIComponent("Brand saved")}`);
}

export async function deleteBrandAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  await removeBrand(id);
  revalidatePath("/admin/brands");
  redirect(`/admin/brands?toast=${encodeURIComponent("Brand deleted")}&toastType=info`);
}
