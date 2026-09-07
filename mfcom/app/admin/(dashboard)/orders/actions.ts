"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateOrderStatus } from "@/lib/orders-store";
import type { OrderStatus, DeliveryProvider } from "@/lib/orders-store";

export async function updateOrderStatusAction(formData: FormData) {
  const orderNumber = String(formData.get("orderNumber") || "");
  const status = String(formData.get("status") || "") as OrderStatus;
  const deliveryProvider = (formData.get("deliveryProvider") || undefined) as DeliveryProvider | undefined;
  const trackingUrl = formData.get("trackingUrl");

  await updateOrderStatus(orderNumber, {
    status,
    deliveryProvider: deliveryProvider || undefined,
    trackingUrl: trackingUrl !== null ? String(trackingUrl) : undefined,
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath(`/track/${orderNumber}`);
  redirect(`/admin/orders/${orderNumber}?toast=${encodeURIComponent("Order status updated")}`);
}
