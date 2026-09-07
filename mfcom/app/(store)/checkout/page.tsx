import CheckoutClient from "@/components/storefront/CheckoutClient";
import { getSettings } from "@/lib/settings-store";

export const metadata = { title: "Checkout" };
export const dynamic = "force-dynamic"; // the shared store layout now reads live categories from Supabase

export default async function CheckoutPage() {
  const settings = await getSettings();
  return <CheckoutClient whatsappNumber={settings.whatsappNumber} freeDeliveryThreshold={settings.freeDeliveryThreshold} />;
}
