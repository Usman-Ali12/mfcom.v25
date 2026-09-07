import { SkeletonBlock } from "@/components/storefront/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-10">
      <SkeletonBlock className="h-3 w-56 mb-8" />
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
        <div>
          <SkeletonBlock className="aspect-square mb-3" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="aspect-square" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-8 w-3/4" />
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-9 w-40" />
          <SkeletonBlock className="h-20 w-full" />
          <SkeletonBlock className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
