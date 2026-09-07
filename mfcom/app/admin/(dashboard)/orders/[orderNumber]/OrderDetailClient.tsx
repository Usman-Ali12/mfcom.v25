"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ChevronRight, MessageCircle, ExternalLink, Loader2 } from "lucide-react";
import type { Order, OrderStatus, DeliveryProvider } from "@/lib/orders-store";
import { formatPrice } from "@/lib/utils";
import Select from "@/components/storefront/Select";
import { updateOrderStatusAction } from "../actions";

// Server actions here redirect on success (see actions.ts), so there's
// nothing wrong with the submit itself — but with no pending indicator,
// the round trip (especially on a slow mobile connection) reads as "did
// clicking that even do anything?" until the toast shows up. useFormStatus
// only works for a descendant of the <form>, hence the separate component.
function SaveStatusButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-11 bg-red text-white text-sm font-medium chamfer-sm hover:bg-red-dim transition-colors disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
    >
      {pending && <Loader2 size={15} className="animate-spin" />}
      {pending ? "Saving…" : "Save status"}
    </button>
  );
}

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending_confirmation", label: "Pending confirmation" },
  { value: "confirmed", label: "Confirmed — good to go" },
  { value: "dispatched", label: "Dispatched" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const PROVIDERS: DeliveryProvider[] = ["Bykea", "Yango", "InDrive", "Other"];

export default function OrderDetailClient({ order, whatsappNumber }: { order: Order; whatsappNumber: string }) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [deliveryProvider, setDeliveryProvider] = useState<string>(order.deliveryProvider || "");

  const waMessage = [
    `Hi ${order.customerName}, update on your order ${order.orderNumber}:`,
    ``,
    status === "confirmed" && `Your order is confirmed and being prepared.`,
    status === "dispatched" && `Your order is on the way${order.deliveryProvider ? ` via ${order.deliveryProvider}` : ""}.`,
    status === "delivered" && `Your order has been delivered. Thanks for shopping with MF COM!`,
    status === "cancelled" && `Your order has been cancelled. Contact us if this wasn't expected.`,
    order.trackingUrl && `Track your delivery: ${order.trackingUrl}`,
    ``,
    `Track anytime: mfcom.pk/track/${order.orderNumber}`,
  ]
    .filter(Boolean)
    .join("\n");

  const customerWaLink = `https://wa.me/92${order.phone.replace(/\D/g, "").replace(/^0/, "")}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-steel mb-4">
        <Link href="/admin/orders" className="hover:text-void">Orders</Link>
        <ChevronRight size={12} />
        <span className="text-void">{order.orderNumber}</span>
      </div>

      <h1 className="font-display text-2xl font-semibold mb-1">{order.orderNumber}</h1>
      <p className="text-sm text-steel mb-8">
        Placed {new Date(order.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
      </p>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          {/* Items */}
          <section className="bg-white border border-line chamfer p-6">
            <p className="mono-label text-[11px] text-red mb-4">Items</p>
            <div className="space-y-2 mb-4">
              {order.items.map((i) => (
                <div key={i.productId} className="flex justify-between text-sm">
                  <span>{i.qty}x {i.name}</span>
                  <span className="font-mono">{formatPrice(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-line pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-steel">
                <span>Subtotal</span>
                <span className="font-mono">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-steel">
                <span>Delivery</span>
                <span className="font-mono">{order.delivery === 0 ? "Free" : formatPrice(order.delivery)}</span>
              </div>
              <div className="flex justify-between font-medium pt-1.5 border-t border-line mt-1.5">
                <span>Total</span>
                <span className="font-mono">{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>

          {/* Customer */}
          <section className="bg-white border border-line chamfer p-6">
            <p className="mono-label text-[11px] text-red mb-3">Customer</p>
            <p className="text-sm mb-1">{order.customerName} · {order.phone}</p>
            <p className="text-sm text-steel">{order.address}</p>
            {order.notes && <p className="text-sm text-steel mt-2 italic">"{order.notes}"</p>}
          </section>
        </div>

        {/* Status management */}
        <section className="h-fit bg-white border border-line chamfer p-6">
          <p className="mono-label text-[11px] text-red mb-4">Update status</p>
          <form action={updateOrderStatusAction} className="space-y-4">
            <input type="hidden" name="orderNumber" value={order.orderNumber} />

            <div>
              <label className="text-xs font-medium block mb-1.5">Status</label>
              <input type="hidden" name="status" value={status} />
              <Select
                value={status}
                onChange={(v) => setStatus(v as OrderStatus)}
                options={STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
              />
            </div>

            {status === "dispatched" && (
              <>
                <div>
                  <label className="text-xs font-medium block mb-1.5">Delivery provider</label>
                  <input type="hidden" name="deliveryProvider" value={deliveryProvider} />
                  <Select
                    value={deliveryProvider}
                    onChange={setDeliveryProvider}
                    placeholder="Select provider"
                    options={PROVIDERS.map((p) => ({ value: p, label: p }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5">Tracking link</label>
                  <input
                    name="trackingUrl"
                    defaultValue={order.trackingUrl || ""}
                    placeholder="Paste the ride/delivery tracking URL"
                    className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
                  />
                  <p className="text-xs text-steel mt-1.5">
                    From the Bykea/Yango/InDrive app once you've booked the rider —
                    the customer sees this on their tracking page.
                  </p>
                </div>
              </>
            )}

            <SaveStatusButton />
          </form>

          <div className="border-t border-line mt-6 pt-5">
            <p className="mono-label text-[11px] text-steel mb-3">Notify customer</p>
            <a
              href={customerWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-11 bg-[#25D366] text-white text-sm font-medium chamfer-sm hover:brightness-95 transition"
            >
              <MessageCircle size={15} /> Message on WhatsApp
            </a>
            <p className="text-xs text-steel mt-2">
              Pre-fills a status update for the currently-selected status above —
              there's no WhatsApp Business API wired up, so this opens WhatsApp
              for you to hit send, rather than sending automatically.
            </p>
          </div>

          {order.trackingUrl && (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-10 mt-3 border border-line chamfer-sm text-sm font-medium hover:bg-paper transition-colors"
            >
              View rider tracking <ExternalLink size={13} />
            </a>
          )}
        </section>
      </div>
    </div>
  );
}
