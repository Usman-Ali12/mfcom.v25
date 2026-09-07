import { SkeletonBlock } from "@/components/storefront/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="space-y-2 mb-6">
        <SkeletonBlock className="h-6 w-28" />
        <SkeletonBlock className="h-3 w-20" />
      </div>
      <div className="bg-white border border-line chamfer overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 border-b border-line last:border-0">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 flex-1" />
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-6 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
