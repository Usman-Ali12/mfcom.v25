import { SkeletonBlock, SkeletonProductCard } from "@/components/storefront/Skeleton";

export default function Loading() {
  return (
    <div>
      {/* Hero skeleton */}
      <section className="bg-void py-14 lg:py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="h-3 w-32 bg-white/10 rounded-none animate-pulse" />
            <div className="h-16 w-full bg-white/10 rounded-none animate-pulse" />
            <div className="h-4 w-3/4 bg-white/10 rounded-none animate-pulse" />
          </div>
          <div className="lg:col-span-7">
            <div className="aspect-[16/10] bg-white/10 animate-pulse chamfer-lg" />
          </div>
        </div>
      </section>

      {/* Product rows skeleton */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-14 space-y-14">
        {Array.from({ length: 2 }).map((_, row) => (
          <div key={row}>
            <SkeletonBlock className="h-6 w-40 mb-6" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonProductCard key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
