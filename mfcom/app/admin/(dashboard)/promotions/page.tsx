import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { listPromotions, getActivePromotion } from "@/lib/promotions-store";
import DeletePromotionButton from "./DeletePromotionButton";

export const metadata = { title: "Promotions" };
export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const promotions = await listPromotions();
  const live = await getActivePromotion();

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Promotions</h1>
          <p className="text-sm text-steel mt-1">
            {live ? `"${live.name}" is live right now` : "No promotion is currently live"}
          </p>
        </div>
        <Link
          href="/admin/promotions/new"
          className="inline-flex items-center gap-2 h-10 px-4 bg-red text-white text-sm font-medium chamfer-sm hover:bg-red-dim transition-colors self-start"
        >
          <Plus size={16} /> New promotion
        </Link>
      </div>

      {/* Mobile: stacked cards — same convention as /admin/products and
          /admin/orders, so a 5-column table never forces horizontal
          scrolling on a phone just to see the status badge. */}
      <div className="sm:hidden space-y-3">
        {promotions.map((p) => {
          const isLive = live?.id === p.id;
          const expired = new Date(p.endDate).getTime() < Date.now();
          return (
            <div key={p.id} className="bg-white border border-line chamfer p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-medium text-sm">{p.name}</p>
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 chamfer-sm whitespace-nowrap ${
                    isLive
                      ? "bg-green-100 text-green-800"
                      : expired
                      ? "bg-void/10 text-void/50"
                      : !p.active
                      ? "bg-void/10 text-void/50"
                      : "bg-red/10 text-red"
                  }`}
                >
                  {isLive ? "Live" : expired ? "Expired" : !p.active ? "Inactive" : "Scheduled"}
                </span>
              </div>
              <p className="text-xs text-steel mb-1">
                {new Date(p.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} –{" "}
                {new Date(p.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </p>
              <p className="text-xs text-steel mb-3">{p.productSlugs.length} products</p>
              <div className="flex items-center gap-1 border-t border-line pt-2 -mb-1">
                <Link
                  href={`/admin/promotions/${p.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 text-xs text-steel hover:text-red transition-colors"
                >
                  <Pencil size={14} /> Edit
                </Link>
                <DeletePromotionButton id={p.id} name={p.name} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: table, horizontally scrollable as a safety net */}
      <div className="hidden sm:block bg-white border border-line chamfer overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-left text-steel bg-paper border-b border-line">
              <th className="p-4 font-normal">Name</th>
              <th className="p-4 font-normal">Window</th>
              <th className="p-4 font-normal">Products</th>
              <th className="p-4 font-normal">Status</th>
              <th className="p-4 font-normal w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((p) => {
              const isLive = live?.id === p.id;
              const expired = new Date(p.endDate).getTime() < Date.now();
              return (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4 text-steel text-xs">
                    {new Date(p.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} –{" "}
                    {new Date(p.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </td>
                  <td className="p-4 text-steel">{p.productSlugs.length}</td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-0.5 chamfer-sm ${
                        isLive
                          ? "bg-green-100 text-green-800"
                          : expired
                          ? "bg-void/10 text-void/50"
                          : !p.active
                          ? "bg-void/10 text-void/50"
                          : "bg-red/10 text-red"
                      }`}
                    >
                      {isLive ? "Live" : expired ? "Expired" : !p.active ? "Inactive" : "Scheduled"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/promotions/${p.id}/edit`}
                        className="p-2 text-steel hover:text-red transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil size={15} />
                      </Link>
                      <DeletePromotionButton id={p.id} name={p.name} />
                    </div>
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
