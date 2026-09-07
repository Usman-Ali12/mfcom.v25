import Link from "next/link";
import { Package, AlertTriangle, Tag, ArrowUpRight, ShoppingBag, Clock } from "lucide-react";
import { listProducts } from "@/lib/admin-store";
import { getActivePromotion } from "@/lib/promotions-store";
import { listOrders } from "@/lib/orders-store";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic"; // reads the live admin-store, not static data

export const metadata = { title: "Overview" };

const STATUS_LABEL: Record<string, string> = {
  pending_confirmation: "Pending",
  confirmed: "Confirmed",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default async function AdminOverviewPage() {
  const products = await listProducts();
  const lowStock = products.filter((p) => p.stock === "low-stock");
  const published = products.length;
  const activePromotion = await getActivePromotion();

  const orders = await listOrders();
  const pendingOrders = orders.filter((o) => o.status === "pending_confirmation");
  const recentOrders = orders.slice(0, 5);
  // Revenue from confirmed/dispatched/delivered orders only — pending
  // orders haven't actually been confirmed as real sales yet.
  const revenue = orders
    .filter((o) => o.status === "confirmed" || o.status === "dispatched" || o.status === "delivered")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Overview</h1>
      <p className="text-sm text-steel mb-8">A snapshot of orders, catalog, and current promotions.</p>

      {/* Orders row — surfaced first: this is what needs the admin's attention day to day */}
      <div className="grid sm:grid-cols-3 gap-5 mb-6">
        <div className="bg-white border border-line chamfer p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="mono-label text-[11px] text-steel">Pending orders</p>
            <Clock size={16} className="text-red" />
          </div>
          <p className="font-mono text-3xl font-semibold">{pendingOrders.length}</p>
          <Link href="/admin/orders" className="text-xs text-red font-medium flex items-center gap-1 mt-2 hover:gap-1.5 transition-all">
            {pendingOrders.length > 0 ? "Review now" : "View all orders"} <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="bg-white border border-line chamfer p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="mono-label text-[11px] text-steel">Total orders</p>
            <ShoppingBag size={16} className="text-red" />
          </div>
          <p className="font-mono text-3xl font-semibold">{orders.length}</p>
          <p className="text-xs text-steel mt-2">All time</p>
        </div>

        <div className="bg-white border border-line chamfer p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="mono-label text-[11px] text-steel">Confirmed revenue</p>
            <Tag size={16} className="text-red" />
          </div>
          <p className="font-mono text-3xl font-semibold">{formatPrice(revenue)}</p>
          <p className="text-xs text-steel mt-2">Confirmed, dispatched &amp; delivered orders</p>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-line chamfer p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="mono-label text-[11px] text-steel">Recent orders</p>
          <Link href="/admin/orders" className="text-xs text-red font-medium flex items-center gap-1 hover:gap-1.5 transition-all">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-steel py-4 text-center">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="text-left text-steel border-b border-line">
                <th className="pb-2 font-normal">Order</th>
                <th className="pb-2 font-normal">Customer</th>
                <th className="pb-2 font-normal">Total</th>
                <th className="pb-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.orderNumber} className="border-b border-line last:border-0 hover:bg-paper/60">
                  <td className="py-2.5">
                    <Link href={`/admin/orders/${o.orderNumber}`} className="font-mono font-medium hover:text-red transition-colors">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="py-2.5">{o.customerName}</td>
                  <td className="py-2.5 font-mono">{formatPrice(o.total)}</td>
                  <td className="py-2.5">
                    <span
                      className={`text-xs px-2 py-0.5 chamfer-sm ${
                        o.status === "pending_confirmation" ? "bg-amber-50 text-amber-700" : "bg-void/5 text-void/70"
                      }`}
                    >
                      {STATUS_LABEL[o.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Catalog row */}
      <div className="grid sm:grid-cols-3 gap-5 mb-6">
        <div className="bg-white border border-line chamfer p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="mono-label text-[11px] text-steel">Products</p>
            <Package size={16} className="text-red" />
          </div>
          <p className="font-mono text-3xl font-semibold">{published}</p>
          <Link href="/admin/products" className="text-xs text-red font-medium flex items-center gap-1 mt-2 hover:gap-1.5 transition-all">
            Manage <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="bg-white border border-line chamfer p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="mono-label text-[11px] text-steel">Low stock</p>
            <AlertTriangle size={16} className="text-red" />
          </div>
          <p className="font-mono text-3xl font-semibold">{lowStock.length}</p>
          <p className="text-xs text-steel mt-2">
            {lowStock.length > 0 ? lowStock.map((p) => p.name).join(", ") : "Nothing needs attention"}
          </p>
        </div>

        <div className="bg-white border border-line chamfer p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="mono-label text-[11px] text-steel">Active promotion</p>
            <Tag size={16} className="text-red" />
          </div>
          <p className="font-medium text-sm">{activePromotion ? activePromotion.name : "None running"}</p>
          {activePromotion && (
            <p className="text-xs text-steel mt-2">
              Ends {new Date(activePromotion.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
