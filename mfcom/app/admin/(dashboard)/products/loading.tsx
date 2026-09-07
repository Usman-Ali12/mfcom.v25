import { SkeletonBlock } from "@/components/storefront/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <SkeletonBlock className="h-6 w-32" />
          <SkeletonBlock className="h-3 w-24" />
        </div>
        <SkeletonBlock className="h-10 w-36" />
      </div>
      <div className="bg-white border border-line chamfer overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 border-b border-line last:border-0">
            <SkeletonBlock className="w-10 h-10 shrink-0" />
            <SkeletonBlock className="h-4 flex-1" />
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
