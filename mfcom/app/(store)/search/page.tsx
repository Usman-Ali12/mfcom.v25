import { Search as SearchIcon } from "lucide-react";
import ProductCard from "@/components/storefront/ProductCard";
import { listProducts } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export function generateMetadata({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || "";
  return { title: q ? `"${q}" — Search` : "Search" };
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = (searchParams.q || "").trim();
  const q = query.toLowerCase();

  const results = q
    ? (await listProducts()).filter((p) => {
        const haystack = `${p.name} ${p.brand} ${p.category} ${p.shortSpec} ${p.sku}`.toLowerCase();
        return haystack.includes(q);
      })
    : [];

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-10">
      {/* Search bar repeated in-page too, since the person may have landed
          here directly (shared link) rather than via the header */}
      <form action="/search" className="mb-8 max-w-lg">
        <div className="flex items-center w-full bg-white dark:bg-graphite border border-line dark:border-white/10 px-4 h-12 chamfer focus-within:ring-1 focus-within:ring-red">
          <SearchIcon size={17} className="text-steel shrink-0" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            autoFocus
            placeholder="Search products, brands, SKUs…"
            className="bg-transparent w-full ml-3 text-sm outline-none dark:text-paper"
          />
        </div>
      </form>

      {!query ? (
        <p className="text-sm text-steel">Start typing to search the catalog.</p>
      ) : (
        <>
          <p className="text-sm text-steel mb-6">
            {results.length} {results.length === 1 ? "result" : "results"} for "{query}"
          </p>
          {results.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-line dark:border-white/15 chamfer">
              <p className="text-sm text-steel mb-1">No products match "{query}".</p>
              <p className="text-xs text-steel/70">Try a brand name, category, or shorter search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
