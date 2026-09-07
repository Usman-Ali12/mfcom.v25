import Link from "next/link";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { listProducts } from "@/lib/admin-store";
import DeleteProductButton from "./DeleteProductButton";

export const metadata = { title: "Products" };
export const dynamic = "force-dynamic"; // reads the live product store, must not be statically cached

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

export default async function AdminProductsPage() {
  const products = await listProducts();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Products</h1>
          <p className="text-sm text-steel mt-1">{products.length} products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 h-10 px-3 sm:px-4 bg-red text-white text-sm font-medium chamfer-sm hover:bg-red-dim transition-colors shrink-0"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Add product</span>
        </Link>
      </div>

      {/* Mobile: stacked cards — nothing gets pushed off-screen the way a
          5-column table would on a narrow viewport. */}
      <div className="sm:hidden space-y-3">
        {products.map((p) => (
          <div key={p.id} className="bg-white border border-line chamfer p-4">
            <div className="flex items-center gap-3 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" className="w-12 h-12 object-cover chamfer-sm bg-paper shrink-0" />
              <div className="min-w-0">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-xs text-steel truncate">{p.brand} · {p.category}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-sm">Rs. {p.price.toLocaleString()}</span>
              <StockBadge stock={p.stock} />
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

      {/* Desktop: table, horizontally scrollable as a safety net at
          intermediate widths rather than ever silently clipping content. */}
      <div className="hidden sm:block bg-white border border-line chamfer overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-steel bg-paper border-b border-line">
              <th className="p-4 font-normal">Product</th>
              <th className="p-4 font-normal">Category</th>
              <th className="p-4 font-normal">Price</th>
              <th className="p-4 font-normal">Stock</th>
              <th className="p-4 font-normal w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-paper/60">
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
