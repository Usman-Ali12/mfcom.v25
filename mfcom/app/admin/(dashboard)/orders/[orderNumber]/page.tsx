import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/orders-store";
import { getSettings } from "@/lib/settings-store";
import OrderDetailClient from "./OrderDetailClient";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { orderNumber: string } }) {
  return { title: `${params.orderNumber}` };
}

export default async function AdminOrderDetailPage({ params }: { params: { orderNumber: string } }) {
  const order = await getOrderByNumber(params.orderNumber);
  if (!order) notFound();
  const settings = await getSettings();

  return <OrderDetailClient order={order} whatsappNumber={settings.whatsappNumber} />;
}
