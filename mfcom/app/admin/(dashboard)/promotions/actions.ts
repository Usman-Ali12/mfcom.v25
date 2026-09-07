"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createPromotion, updatePromotion, removePromotion } from "@/lib/promotions-store";
import type { Promotion } from "@/lib/promotions-store";

function readPromoForm(formData: FormData): Omit<Promotion, "id"> {
  const slugsRaw = String(formData.get("productSlugs") || "");
  return {
    name: String(formData.get("name") || ""),
    title: String(formData.get("title") || ""),
    message: String(formData.get("message") || ""),
    startDate: String(formData.get("startDate") || ""),
    endDate: String(formData.get("endDate") || ""),
    productSlugs: slugsRaw.split(",").map((s) => s.trim()).filter(Boolean),
    active: formData.get("active") === "on",
  };
}

export async function createPromotionAction(formData: FormData) {
  const input = readPromoForm(formData);
  await createPromotion(input);
  revalidatePath("/admin/promotions");
  revalidatePath("/");
  revalidatePath("/deals");
  redirect(`/admin/promotions?toast=${encodeURIComponent(`"${input.name}" created`)}`);
}

export async function updatePromotionAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const input = readPromoForm(formData);
  await updatePromotion(id, input);
  revalidatePath("/admin/promotions");
  revalidatePath("/");
  revalidatePath("/deals");
  redirect(`/admin/promotions?toast=${encodeURIComponent(`"${input.name}" saved`)}`);
}

export async function deletePromotionAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  await removePromotion(id);
  revalidatePath("/admin/promotions");
  revalidatePath("/");
  revalidatePath("/deals");
  redirect(`/admin/promotions?toast=${encodeURIComponent("Promotion deleted")}&toastType=info`);
}
