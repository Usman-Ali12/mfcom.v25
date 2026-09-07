import Link from "next/link";
import { Package, Clock, CheckCircle2, Truck, PackageCheck, XCircle, ChevronRight } from "lucide-react";
import { listOrders } from "@/lib/orders-store";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

const STATUS_META: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  pending_confirmation: { label: "Pending", icon: Clock, className: "bg-amber-50 text-amber-700" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, className: "bg-blue-50 text-blue-700" },
  dispatched: { label: "Dispatched", icon: Truck, className: "bg-red/10 text-red" },
  delivered: { label: "Delivered", icon: PackageCheck, className: "bg-green-50 text-green-700" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-void/10 text-void/50" },
};

export default async function AdminOrdersPage() {
  const orders = await listOrders();

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold mb-1">Orders</h1>
        <p className="text-sm text-steel mb-8 max-w-2xl">
          No orders yet — they'll appear here as soon as someone checks out on the storefront.
          Once one exists, tap into it to confirm it, mark it dispatched with a Bykea/Yango/InDrive
          tracking link, or mark it delivered.
        </p>
        <div className="bg-white border border-dashed border-line chamfer p-10 text-center max-w-xl">
          <Package size={28} className="mx-auto mb-4 text-steel" />
          <p className="text-sm text-steel">Nothing to show yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Orders</h1>
      <p className="text-sm text-steel mb-6">{orders.length} orders — tap one to confirm, dispatch, or mark delivered</p>

      {/* Mobile: stacked cards */}
      <div className="sm:hidden space-y-3">
        {orders.map((o) => {
          const meta = STATUS_META[o.status];
          const StatusIcon = meta.icon;
          return (
            <Link
              key={o.orderNumber}
              href={`/admin/orders/${o.orderNumber}`}
              className="block bg-white border border-line chamfer p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-medium text-sm">{o.orderNumber}</span>
                <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 chamfer-sm ${meta.className}`}>
                  <StatusIcon size={12} /> {meta.label}
                </span>
              </div>
              <p className="text-sm mb-0.5">{o.customerName}</p>
              <p className="text-xs text-steel font-mono mb-2">{o.phone}</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-medium">{formatPrice(o.total)}</span>
                <span className="flex items-center gap-1 text-xs text-red">
                  Manage <ChevronRight size={13} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Desktop: table, horizontally scrollable as a safety net */}
      <div className="hidden sm:block bg-white border border-line chamfer overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-steel bg-paper border-b border-line">
              <th className="p-4 font-normal">Order</th>
              <th className="p-4 font-normal">Customer</th>
              <th className="p-4 font-normal">Total</th>
              <th className="p-4 font-normal">Status</th>
              <th className="p-4 font-normal">Placed</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const meta = STATUS_META[o.status];
              const StatusIcon = meta.icon;
              return (
                <tr key={o.orderNumber} className="border-b border-line last:border-0 hover:bg-paper/60">
                  <td className="p-4">
                    <Link href={`/admin/orders/${o.orderNumber}`} className="font-mono font-medium hover:text-red transition-colors">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <p>{o.customerName}</p>
                    <p className="text-xs text-steel font-mono">{o.phone}</p>
                  </td>
                  <td className="p-4 font-mono whitespace-nowrap">{formatPrice(o.total)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 chamfer-sm whitespace-nowrap ${meta.className}`}>
                      <StatusIcon size={12} /> {meta.label}
                    </span>
                  </td>
                  <td className="p-4 text-steel text-xs whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
