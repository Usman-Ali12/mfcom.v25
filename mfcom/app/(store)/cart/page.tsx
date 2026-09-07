import CartPageClient from "@/components/storefront/CartPageClient";
import { getSettings } from "@/lib/settings-store";

export const metadata = { title: "Your Cart" };
export const dynamic = "force-dynamic"; // the shared store layout now reads live categories from Supabase

export default async function CartPage() {
  const settings = await getSettings();
  return <CartPageClient whatsappNumber={settings.whatsappNumber} />;
}
