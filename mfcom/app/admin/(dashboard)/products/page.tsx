import Link from "next/link";
import { Plus, Upload, Download } from "lucide-react";
import { listProducts } from "@/lib/admin-store";
import { listCategories } from "@/lib/categories-store";
import ProductsListClient from "./ProductsListClient";

export const metadata = { title: "Products" };
export const dynamic = "force-dynamic"; // reads the live product store, must not be statically cached

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Products</h1>
          <p className="text-sm text-steel mt-1">{products.length} products</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/api/admin/products-export"
            className="flex items-center gap-2 h-10 px-3 sm:px-4 border border-line text-sm font-medium chamfer-sm hover:border-void transition-colors"
          >
            <Download size={16} /> <span className="hidden sm:inline">Export CSV</span>
          </a>
          <Link
            href="/admin/products/import"
            className="flex items-center gap-2 h-10 px-3 sm:px-4 border border-line text-sm font-medium chamfer-sm hover:border-void transition-colors"
          >
            <Upload size={16} /> <span className="hidden sm:inline">Import CSV</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 h-10 px-3 sm:px-4 bg-red text-white text-sm font-medium chamfer-sm hover:bg-red-dim transition-colors"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Add product</span>
          </Link>
        </div>
      </div>

      <ProductsListClient products={products} categoryNames={categories.map((c) => c.name)} />
    </div>
  );
}
