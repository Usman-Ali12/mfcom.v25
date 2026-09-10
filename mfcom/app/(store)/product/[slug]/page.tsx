import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductPurchasePanel from "@/components/storefront/ProductPurchasePanel";
import ProductCard from "@/components/storefront/ProductCard";
import { StaggerGrid, StaggerItem } from "@/components/storefront/StaggerGrid";
import { listProducts } from "@/lib/admin-store";
import { getSettings } from "@/lib/settings-store";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic"; // real DB query per request — avoids requiring DB access at *build* time (ISR would), which is safer across hosting setups

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = (await listProducts()).find((p) => p.slug === params.slug);
  if (!product) return {};
  const url = `${SITE_URL}/product/${product.slug}`;
  // Bare name for the <title> tag — the root layout's "%s — MF COM"
  // template appends the suffix automatically. OG/Twitter titles are
  // independent fields nothing templates, so they keep the full form.
  const title = product.name;
  const fullTitle = `${product.name} — ${SITE_NAME}`;
  // Full sentence description reads better in a Google snippet and does
  // more to earn the click than the terse spec bullet ("59g · 30K DPI
  // sensor · 90hr battery") — shortSpec is a fallback for the rare
  // product with no description written yet, not the default.
  const description = product.description
    ? product.description.slice(0, 155)
    : product.shortSpec;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: product.image }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const allProducts = await listProducts();
  const product = allProducts.find((p) => p.slug === params.slug);
  if (!product) notFound();

  const related = allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const settings = await getSettings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.gallery.length ? product.gallery : [product.image],
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: product.currency,
      price: product.price,
      itemCondition:
        product.condition === "used"
          ? "https://schema.org/UsedCondition"
          : "https://schema.org/NewCondition",
      availability:
        product.stock === "out-of-stock"
          ? "https://schema.org/OutOfStock"
          : product.stock === "low-stock"
          ? "https://schema.org/LimitedAvailability"
          : "https://schema.org/InStock",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: product.category, item: `${SITE_URL}/category/${product.category.toLowerCase().replace(/\s+/g, "-")}` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${SITE_URL}/product/${product.slug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="flex items-center gap-1.5 text-xs text-steel mb-8">
        <Link href="/" className="hover:text-void dark:hover:text-paper">Home</Link>
        <ChevronRight size={12} />
        <Link href={`/category/${product.category.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-void dark:hover:text-paper">
          {product.category}
        </Link>
        <ChevronRight size={12} />
        <span className="text-void dark:text-paper">{product.name}</span>
      </div>

      <ProductPurchasePanel product={product} whatsappNumber={settings.whatsappNumber} />

      {/* Specifications */}
      <section className="mt-16 max-w-3xl">
        <h2 className="font-display text-xl font-semibold mb-5">Specifications</h2>
        <dl className="border-t border-line dark:border-white/10">
          {product.specifications.map((spec) => (
            <div
              key={spec.label}
              className="grid grid-cols-2 gap-4 py-3.5 border-b border-line dark:border-white/10 text-sm dark:text-paper/90"
            >
              <dt className="mono-label text-[11px] text-steel self-center">{spec.label}</dt>
              <dd className="text-void dark:text-paper">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl font-semibold mb-6">You may also like</h2>
          <StaggerGrid className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7">
            {related.map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      )}
    </div>
  );
}
