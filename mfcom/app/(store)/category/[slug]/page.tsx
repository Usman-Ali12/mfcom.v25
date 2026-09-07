import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductGrid from "@/components/storefront/ProductGrid";
import { getCategoryBySlug, listCategoryGroups } from "@/lib/categories-store";
import { listProducts } from "@/lib/admin-store";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic"; // see note on the other catalog pages

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return {};
  return {
    title: category.name,
    description: `Shop ${category.name} at MF COM — part of our ${category.group} range, in stock in Karachi.`,
    alternates: { canonical: `${SITE_URL}/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const allProducts = await listProducts();
  const categoryProducts = allProducts.filter((p) => p.category === category.name);
  const categoryGroups = await listCategoryGroups();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: category.name, item: `${SITE_URL}/category/${category.slug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="flex items-center gap-1.5 text-xs text-steel mb-4">
        <Link href="/" className="hover:text-void dark:hover:text-paper">Home</Link>
        <ChevronRight size={12} />
        <span>{category.group}</span>
        <ChevronRight size={12} />
        <span className="text-void dark:text-paper">{category.name}</span>
      </div>

      <div className="mb-8">
        <p className="mono-label text-xs text-red mb-2">{category.group}</p>
        <h1 className="font-display text-display-md font-semibold">{category.name}</h1>
      </div>

      {categoryProducts.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-line dark:border-white/15 chamfer">
          <p className="text-sm text-steel mb-1">No products in this category yet.</p>
          <p className="text-xs text-steel/70">New stock is added regularly — check back soon.</p>
        </div>
      ) : (
        <ProductGrid products={categoryProducts} categoryGroups={categoryGroups} lockedCategory={category.name} />
      )}
    </div>
  );
}
