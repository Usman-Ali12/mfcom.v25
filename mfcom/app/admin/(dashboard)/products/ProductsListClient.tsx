"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, ExternalLink, Loader2, X, Sparkles } from "lucide-react";
import Select from "@/components/storefront/Select";
import DeleteProductButton from "./DeleteProductButton";
import { bulkUpdateCategoryAction, bulkUpdateConditionAction, bulkDeleteAction, bulkEnrichAction } from "./actions";
import type { Product } from "@/lib/mock-data";

function StockBadge({ stock }: { stock: string }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 chamfer-sm whitespace-nowrap ${
        stock === "low-stock"
          ? "bg-red/10 text-red"
          : stock === "out-of-stock"
          ? "bg-void/10 text-void/60"
          : "bg-void/5 text-void/70"
      }`}
    >
      {stock === "low-stock" ? "Low stock" : stock === "out-of-stock" ? "Out of stock" : "In stock"}
    </span>
  );
}

function ConditionBadge({ condition }: { condition: string }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 chamfer-sm whitespace-nowrap ${
        condition === "used" ? "bg-amber-600/10 text-amber-700" : "bg-void/5 text-void/70"
      }`}
    >
      {condition === "used" ? "Used" : "New"}
    </span>
  );
}

export default function ProductsListClient({
  products,
  categoryNames,
}: {
  products: Product[];
  categoryNames: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState("");
  const [pending, startTransition] = useTransition();

  const allSelected = products.length > 0 && selected.size === products.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  }

  const MAX_ENRICH_BATCH = 20;

  function runBulk(
    action: () => Promise<{ success: number; failed: string[]; skipped?: number }>,
    verb: string
  ) {
    startTransition(async () => {
      const result = await action();
      const skippedNote = result.skipped ? `, ${result.skipped} already had details` : "";
      if (result.failed.length > 0 || result.skipped) {
        alert(`${result.success} ${verb}${skippedNote}${result.failed.length ? `, ${result.failed.length} failed` : ""}.`);
      }
      setSelected(new Set());
      setBulkCategory("");
      router.refresh();
    });
  }

  const ids = Array.from(selected);

  return (
    <div>
      {/* Bulk action bar — only takes up space once something's selected,
          mainly useful right after a big CSV import for moving a batch of
          "Uncategorized" rows into a real category in one shot. */}
      {selected.size > 0 && (
        <div className="sticky top-0 z-20 -mx-4 sm:mx-0 mb-4 bg-void text-white px-4 sm:chamfer-sm py-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            <div className="w-44">
              <Select
                value={bulkCategory}
                onChange={setBulkCategory}
                placeholder="Move to category…"
                options={categoryNames.map((c) => ({ value: c, label: c }))}
              />
            </div>
            <button
              disabled={!bulkCategory || pending}
              onClick={() => runBulk(() => bulkUpdateCategoryAction(ids, bulkCategory), "moved")}
              className="press h-9 px-3 bg-white text-void text-xs font-medium chamfer-sm disabled:opacity-50"
            >
              Apply
            </button>
          </div>
          <button
            disabled={pending}
            onClick={() => runBulk(() => bulkUpdateConditionAction(ids, "new"), "marked New")}
            className="press h-9 px-3 border border-white/30 text-xs font-medium chamfer-sm hover:bg-white/10"
          >
            Mark New
          </button>
          <button
            disabled={pending}
            onClick={() => runBulk(() => bulkUpdateConditionAction(ids, "used"), "marked Used")}
            className="press h-9 px-3 border border-white/30 text-xs font-medium chamfer-sm hover:bg-white/10"
          >
            Mark Used
          </button>
          <button
            disabled={pending}
            title="Fills in description/specs for products that only have a name — skips anything already filled in"
            onClick={() => {
              if (selected.size > MAX_ENRICH_BATCH) {
                alert(
                  `AI enrich works in batches of ${MAX_ENRICH_BATCH} at a time (a bigger batch risks timing out mid-way). Select ${MAX_ENRICH_BATCH} or fewer and run it again for the rest.`
                );
                return;
              }
              runBulk(() => bulkEnrichAction(ids), "AI-enriched");
            }}
            className="press flex items-center gap-1.5 h-9 px-3 border border-white/30 text-xs font-medium chamfer-sm hover:bg-white/10"
          >
            <Sparkles size={13} /> AI Enrich
          </button>
          <button
            disabled={pending}
            onClick={() => {
              if (confirm(`Delete ${selected.size} product${selected.size === 1 ? "" : "s"}? This can't be undone.`)) {
                runBulk(() => bulkDeleteAction(ids), "deleted");
              }
            }}
            className="press h-9 px-3 bg-red text-white text-xs font-medium chamfer-sm"
          >
            Delete
          </button>
          {pending && <Loader2 size={16} className="animate-spin" />}
          <button onClick={() => setSelected(new Set())} className="ml-auto text-white/70 hover:text-white" aria-label="Clear selection">
            <X size={16} />
          </button>
        </div>
      )}

      <label className="hidden sm:flex items-center gap-2 mb-2 text-xs text-steel">
        <input type="checkbox" checked={allSelected} onChange={toggleAll} />
        Select all
      </label>

      {/* Mobile: stacked cards */}
      <div className="sm:hidden space-y-3">
        {products.map((p) => (
          <div key={p.id} className={`bg-white border chamfer p-4 ${selected.has(p.id) ? "border-red" : "border-line"}`}>
            <div className="flex items-center gap-3 mb-3">
              <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="shrink-0" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" className="w-12 h-12 object-cover chamfer-sm bg-paper shrink-0" />
              <div className="min-w-0">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-xs text-steel truncate">{p.brand} · {p.category}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-sm">Rs. {p.price.toLocaleString()}</span>
              <div className="flex items-center gap-1.5">
                <ConditionBadge condition={p.condition} />
                <StockBadge stock={p.stock} />
              </div>
            </div>
            <div className="flex items-center gap-1 border-t border-line pt-2 -mb-1">
              <Link
                href={`/product/${p.slug}`}
                target="_blank"
                className="flex-1 flex items-center justify-center gap-1.5 h-9 text-xs text-steel hover:text-void transition-colors"
              >
                <ExternalLink size={14} /> View
              </Link>
              <Link
                href={`/admin/products/${p.id}/edit`}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 text-xs text-steel hover:text-red transition-colors"
              >
                <Pencil size={14} /> Edit
              </Link>
              <DeleteProductButton id={p.id} name={p.name} />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block bg-white border border-line chamfer overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-steel bg-paper border-b border-line">
              <th className="p-4 w-10"></th>
              <th className="p-4 font-normal">Product</th>
              <th className="p-4 font-normal">Category</th>
              <th className="p-4 font-normal">Condition</th>
              <th className="p-4 font-normal">Price</th>
              <th className="p-4 font-normal">Stock</th>
              <th className="p-4 font-normal w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className={`border-b border-line last:border-0 hover:bg-paper/60 ${selected.has(p.id) ? "bg-red/5" : ""}`}
              >
                <td className="p-4">
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt="" className="w-10 h-10 object-cover chamfer-sm bg-paper" />
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-steel">{p.brand} · {p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-steel whitespace-nowrap">{p.category}</td>
                <td className="p-4">
                  <ConditionBadge condition={p.condition} />
                </td>
                <td className="p-4 font-mono whitespace-nowrap">Rs. {p.price.toLocaleString()}</td>
                <td className="p-4">
                  <StockBadge stock={p.stock} />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/product/${p.slug}`}
                      target="_blank"
                      className="p-2 text-steel hover:text-void transition-colors"
                      aria-label="View on storefront"
                    >
                      <ExternalLink size={15} />
                    </Link>
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="p-2 text-steel hover:text-red transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil size={15} />
                    </Link>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
