import ProductCard from "@/components/storefront/ProductCard";
import CountdownTimer from "@/components/storefront/CountdownTimer";
import { StaggerGrid, StaggerItem } from "@/components/storefront/StaggerGrid";
import { listProducts } from "@/lib/admin-store";
import { getActivePromotion } from "@/lib/promotions-store";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic"; // see note on the other catalog pages
export const metadata = {
  title: "Deals & Flash Sales",
  description: "Current deals and flash sales on computer and gaming accessories at MF COM, Karachi.",
  alternates: { canonical: `${SITE_URL}/deals` },
};

export default async function DealsPage() {
  const allProducts = await listProducts();
  const activePromotion = await getActivePromotion();
  const promoProducts = activePromotion
    ? allProducts.filter((p) => activePromotion.productSlugs.includes(p.slug))
    : [];
  // Deals page also surfaces anything discounted, even outside an active
  // promotion window — a permanent markdown is still a deal.
  const discounted = allProducts.filter((p) => p.previousPrice);
  const dealProducts = Array.from(new Map([...promoProducts, ...discounted].map((p) => [p.id, p])).values());

  return (
    <div>
      {activePromotion && (
        <section className="bg-void text-paper">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p className="mono-label text-xs text-red mb-3">{activePromotion.title}</p>
              <h1 className="font-display text-display-md font-semibold mb-2">{activePromotion.message}</h1>
            </div>
            <CountdownTimer endsAt={activePromotion.endDate} />
          </div>
        </section>
      )}

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12">
        {!activePromotion && (
          <h1 className="font-display text-display-md font-semibold mb-8">Deals</h1>
        )}
        {dealProducts.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-line dark:border-white/15 chamfer">
            <p className="text-sm text-steel">No deals running right now — check back soon.</p>
          </div>
        ) : (
          <StaggerGrid className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-7">
            {dealProducts.map((p) => (
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
