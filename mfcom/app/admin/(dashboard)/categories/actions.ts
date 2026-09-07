"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createCategory, updateCategory, removeCategory } from "@/lib/categories-store";

export async function createCategoryAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const group = String(formData.get("group") || "").trim();
  if (name && group) await createCategory({ name, group });
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  redirect(`/admin/categories?toast=${encodeURIComponent(name ? `"${name}" added` : "Category added")}`);
}

export async function updateCategoryAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const group = String(formData.get("group") || "").trim();
  if (id) await updateCategory(id, { name, group });
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  redirect(`/admin/categories?toast=${encodeURIComponent("Category saved")}`);
}

export async function deleteCategoryAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  await removeCategory(id);
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  redirect(`/admin/categories?toast=${encodeURIComponent("Category deleted")}&toastType=info`);
}
