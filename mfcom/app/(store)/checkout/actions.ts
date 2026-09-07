"use server";

import { createOrder } from "@/lib/orders-store";
import { formatPrice } from "@/lib/utils";

export type PlaceOrderInput = {
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  items: { productId: string; name: string; slug: string; price: number; qty: number }[];
  subtotal: number;
  delivery: number;
  total: number;
  whatsappNumber: string;
};

export async function placeOrderAction(input: PlaceOrderInput) {
  const order = await createOrder({
    customerName: input.customerName,
    phone: input.phone,
    address: input.address,
    notes: input.notes,
    items: input.items,
    subtotal: input.subtotal,
    delivery: input.delivery,
    total: input.total,
  });

  const lines = [
    `New order — ${order.orderNumber}`,
    ``,
    `Name: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Address: ${order.address}`,
    ...(order.notes ? [`Notes: ${order.notes}`] : []),
    ``,
    ...order.items.map((i) => `${i.qty}x ${i.name} — ${formatPrice(i.price * i.qty)}`),
    ``,
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `Delivery: ${order.delivery === 0 ? "Free" : formatPrice(order.delivery)}`,
    `Total: ${formatPrice(order.total)}`,
    ``,
    `Track: mfcom.pk/track/${order.orderNumber}`,
  ];
  const whatsappUrl = `https://wa.me/${input.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;

  return { orderNumber: order.orderNumber, whatsappUrl };
}
