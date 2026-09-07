import { SkeletonBlock, SkeletonProductGrid } from "@/components/storefront/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 space-y-2">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-8 w-72" />
      </div>
      <SkeletonProductGrid count={8} />
    </div>
  );
}
