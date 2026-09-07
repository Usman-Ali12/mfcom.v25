import { SkeletonBlock, SkeletonProductGrid } from "@/components/storefront/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 space-y-2">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-8 w-64" />
      </div>
      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        <aside className="hidden lg:block space-y-6">
          <SkeletonBlock className="h-4 w-20" />
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-3 w-28" />
            ))}
          </div>
        </aside>
        <SkeletonProductGrid />
      </div>
    </div>
  );
}
