"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/storefront/ProductCard";
import Select from "@/components/storefront/Select";
import { StaggerGrid, StaggerItem } from "@/components/storefront/StaggerGrid";
import type { Product } from "@/lib/mock-data";

type Sort = "featured" | "price-asc" | "price-desc" | "rating";

export default function ProductGrid({
  products,
  categoryGroups,
  lockedCategory,
}: {
  products: Product[];
  categoryGroups: { group: string; items: string[] }[];
  /** When set (category page), the category filter is hidden — it's implied by the route. */
  lockedCategory?: string;
}) {
  const allCategories = categoryGroups.flatMap((g) => g.items);
  const [activeBrands, setActiveBrands] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCondition, setActiveCondition] = useState<"" | "new" | "used">("");
  const [sort, setSort] = useState<Sort>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Only show the condition filter at all when the current product set
  // actually has used items — most categories are 100% new stock, and a
  // filter with one dead option (everything already matches "New") just
  // adds noise.
  const hasUsedItems = useMemo(() => products.some((p) => p.condition === "used"), [products]);

  // Derived straight from the products on this page rather than a static
  // brand list — brands now come from the admin-managed brands table
  // (lib/brands-store.ts), and a filter list that only shows brands that
  // actually have a product here never needs manual syncing when a new
  // brand is added in /admin/brands.
  const brandsInScope = useMemo(() => {
    const seen = new Set<string>();
    for (const p of products) if (p.brand) seen.add(p.brand);
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (!lockedCategory && activeCategory) {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (activeBrands.length) {
      list = list.filter((p) => activeBrands.includes(p.brand));
    }
    if (activeCondition) {
      list = list.filter((p) => p.condition === activeCondition);
    }
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [products, activeCategory, activeBrands, activeCondition, sort, lockedCategory]);

  function toggleBrand(b: string) {
    setActiveBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  }

  return (
    <div className="grid lg:grid-cols-[240px_1fr] gap-8">
      {/* Filters — sidebar on desktop, collapsible on mobile */}
      <aside className="lg:block">
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="lg:hidden flex items-center gap-2 h-10 px-4 border border-line dark:border-white/10 chamfer-sm text-sm mb-4 dark:text-paper"
        >
          <SlidersHorizontal size={14} /> Filters
        </button>

        <div className={`${filtersOpen ? "block" : "hidden"} lg:block space-y-8`}>
          {!lockedCategory && (
            <div>
              <p className="mono-label text-[11px] text-steel mb-3">Category</p>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`text-sm ${!activeCategory ? "text-red font-medium" : "text-void/70 dark:text-paper/70 hover:text-void dark:hover:text-paper"}`}
                  >
                    All categories
                  </button>
                </li>
                {allCategories
                  .filter((c) => products.some((p) => p.category === c))
                  .map((c) => (
                    <li key={c}>
                      <button
                        onClick={() => setActiveCategory(c)}
                        className={`text-sm ${activeCategory === c ? "text-red font-medium" : "text-void/70 dark:text-paper/70 hover:text-void dark:hover:text-paper"}`}
                      >
                        {c}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {hasUsedItems && (
            <div>
              <p className="mono-label text-[11px] text-steel mb-3">Condition</p>
              <ul className="space-y-2">
                {[
                  { value: "", label: "All" },
                  { value: "new", label: "Brand New" },
                  { value: "used", label: "Used" },
                ].map((opt) => (
                  <li key={opt.value}>
                    <button
                      onClick={() => setActiveCondition(opt.value as "" | "new" | "used")}
                      className={`text-sm ${
                        activeCondition === opt.value
                          ? "text-red font-medium"
                          : "text-void/70 dark:text-paper/70 hover:text-void dark:hover:text-paper"
                      }`}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="mono-label text-[11px] text-steel mb-3">Brand</p>
            <ul className="space-y-2.5">
              {brandsInScope.map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`brand-${b}`}
                    checked={activeBrands.includes(b)}
                    onChange={() => toggleBrand(b)}
                    className="accent-red w-4 h-4"
                  />
                  <label htmlFor={`brand-${b}`} className="text-sm text-void/80 dark:text-paper/80">
                    {b}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-steel">{filtered.length} products</p>
          <Select
            value={sort}
            onChange={(v) => setSort(v as Sort)}
            className="w-44"
            options={[
              { value: "featured", label: "Featured" },
              { value: "price-asc", label: "Price: Low to High" },
              { value: "price-desc", label: "Price: High to Low" },
              { value: "rating", label: "Top Rated" },
            ]}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-line dark:border-white/15 chamfer">
            <p className="text-sm text-steel">No products match those filters.</p>
          </div>
        ) : (
          <StaggerGrid className="grid grid-cols-2 md:grid-cols-3 gap-5 sm:gap-7">
            {filtered.map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
      </div>
    </div>
  );
}
