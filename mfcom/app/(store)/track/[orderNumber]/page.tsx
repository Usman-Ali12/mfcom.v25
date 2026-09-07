import Link from "next/link";
import { getOrderByNumber } from "@/lib/orders-store";
import { formatPrice } from "@/lib/utils";
import { Package, CheckCircle2, Clock, XCircle, Truck, PackageCheck, ExternalLink, Check } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_META = {
  pending_confirmation: { label: "Pending confirmation", icon: Clock, color: "text-amber-600 bg-amber-50" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "text-blue-700 bg-blue-50" },
  dispatched: { label: "Dispatched", icon: Truck, color: "text-red bg-red/10" },
  delivered: { label: "Delivered", icon: PackageCheck, color: "text-green-700 bg-green-50" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-void/50 bg-void/10" },
};

// Ordered progression for the visual tracker — cancelled is handled separately.
const PROGRESS_STEPS = [
  { key: "pending_confirmation", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "dispatched", label: "Dispatched" },
  { key: "delivered", label: "Delivered" },
] as const;

export function generateMetadata({ params }: { params: { orderNumber: string } }) {
  return { title: `Track ${params.orderNumber}` };
}

export default async function TrackOrderPage({ params }: { params: { orderNumber: string } }) {
  const order = await getOrderByNumber(params.orderNumber);

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-24 text-center">
        <Package size={40} className="mx-auto mb-4 text-steel" />
        <h1 className="font-display text-xl font-semibold mb-2 dark:text-paper">Order not found</h1>
        <p className="text-sm text-steel">
          We couldn't find an order matching "{params.orderNumber}". Double-check
          the order number, or contact us on WhatsApp if you need help.
        </p>
      </div>
    );
  }

  const status = STATUS_META[order.status];
  const StatusIcon = status.icon;
  const isCancelled = order.status === "cancelled";
  const currentStepIndex = PROGRESS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="mono-label text-xs text-red mb-1">Order</p>
          <h1 className="font-display text-2xl font-semibold dark:text-paper">{order.orderNumber}</h1>
        </div>
        <span className={`flex items-center gap-1.5 text-sm px-3 py-1.5 chamfer-sm ${status.color}`}>
          <StatusIcon size={14} /> {status.label}
        </span>
      </div>

      {/* Visual progress tracker — Jarir-style clarity: exactly where the
          order is, at a glance, no ambiguity. */}
      {!isCancelled && (
        <div className="bg-white dark:bg-graphite border border-line dark:border-white/10 chamfer p-6 mb-6">
          <div className="flex items-center">
            {PROGRESS_STEPS.map((step, i) => {
              const reached = i <= currentStepIndex;
              const isLast = i === PROGRESS_STEPS.length - 1;
              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        reached ? "bg-red text-white" : "bg-paper dark:bg-void border border-line dark:border-white/15 text-steel"
                      }`}
                    >
                      {reached ? <Check size={15} /> : <span className="text-xs">{i + 1}</span>}
                    </div>
                    <span className={`text-[11px] text-center ${reached ? "text-void dark:text-paper font-medium" : "text-steel"}`}>
                      {step.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div className={`flex-1 h-0.5 mx-2 mb-5 ${i < currentStepIndex ? "bg-red" : "bg-line dark:bg-white/10"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live tracking link — shown once the admin has dispatched with a rider */}
      {order.status === "dispatched" && order.trackingUrl && (
        <a
          href={order.trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full h-12 mb-6 bg-red text-white text-sm font-medium chamfer hover:bg-red-dim transition-colors"
        >
          Track your delivery{order.deliveryProvider ? ` on ${order.deliveryProvider}` : ""} <ExternalLink size={15} />
        </a>
      )}

      <div className="bg-white dark:bg-graphite border border-line dark:border-white/10 chamfer p-6 mb-6">
        <p className="mono-label text-[11px] text-steel mb-3">Items</p>
        <div className="space-y-2 mb-4">
          {order.items.map((i) => (
            <div key={i.productId} className="flex justify-between text-sm dark:text-paper/90">
              <span>{i.qty}x {i.name}</span>
              <span className="font-mono">{formatPrice(i.price * i.qty)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-line dark:border-white/10 pt-3 flex justify-between text-sm font-medium dark:text-paper">
          <span>Total</span>
          <span className="font-mono">{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-graphite border border-line dark:border-white/10 chamfer p-6">
        <p className="mono-label text-[11px] text-steel mb-3">Delivery details</p>
        <p className="text-sm dark:text-paper/90 mb-1">{order.customerName} · {order.phone}</p>
        <p className="text-sm text-steel">{order.address}</p>
        <p className="text-xs text-steel mt-4">
          Placed {new Date(order.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
        </p>
      </div>

      <p className="text-center text-xs text-steel mt-8">
        Bookmark this page to check back — or{" "}
        <Link href="/contact" className="text-red hover:underline">contact us</Link> if anything looks off.
      </p>
    </div>
  );
}
