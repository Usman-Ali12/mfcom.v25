"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateSettings } from "@/lib/settings-store";

export async function updateSettingsAction(formData: FormData) {
  await updateSettings({
    whatsappPrimaryName: String(formData.get("whatsappPrimaryName") || ""),
    whatsappNumber: String(formData.get("whatsappNumber") || ""),
    whatsappDisplay: String(formData.get("whatsappDisplay") || ""),
    whatsappSecondaryName: String(formData.get("whatsappSecondaryName") || ""),
    whatsappSecondaryNumber: String(formData.get("whatsappSecondaryNumber") || ""),
    whatsappSecondaryDisplay: String(formData.get("whatsappSecondaryDisplay") || ""),
    whatsappDefaultMessage: String(formData.get("whatsappDefaultMessage") || ""),
    address: String(formData.get("address") || ""),
    email: String(formData.get("email") || ""),
    tagline: String(formData.get("tagline") || ""),
    freeDeliveryThreshold: Number(formData.get("freeDeliveryThreshold") || 0),
  });

  // Every route that renders these values reads them fresh on each request
  // (force-dynamic), so revalidating just clears any residual cache.
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}
