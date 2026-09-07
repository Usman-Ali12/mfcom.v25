import ProductGrid from "@/components/storefront/ProductGrid";
import { listProducts } from "@/lib/admin-store";
import { listCategoryGroups } from "@/lib/categories-store";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic"; // real DB query per request — avoids requiring DB access at *build* time (ISR would), which is safer across hosting setups

export const metadata = {
  title: "Shop All Products",
  description: "Browse MF COM's full catalog of computer and gaming accessories — laptops, components, peripherals, and more. In stock in Karachi.",
  alternates: { canonical: `${SITE_URL}/shop` },
  openGraph: {
    title: "Shop All Products — MF COM",
    description: "Browse MF COM's full catalog of computer and gaming accessories — laptops, components, peripherals, and more.",
    url: `${SITE_URL}/shop`,
    siteName: "MF COM",
    type: "website",
  },
};

export default async function ShopPage() {
  const products = await listProducts();
  const categoryGroups = await listCategoryGroups();
  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="mono-label text-xs text-red mb-2">Full catalog</p>
        <h1 className="font-display text-display-md font-semibold">Shop all products</h1>
      </div>
      <ProductGrid products={products} categoryGroups={categoryGroups} />
    </div>
  );
}
