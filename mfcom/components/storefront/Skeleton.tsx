export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-line dark:bg-white/10 chamfer-sm ${className}`} />;
}

export function SkeletonProductCard() {
  return (
    <div className="bg-white dark:bg-graphite chamfer border border-line dark:border-white/10 overflow-hidden">
      <SkeletonBlock className="aspect-[4/3] rounded-none chamfer-none" />
      <div className="p-4 space-y-2">
        <SkeletonBlock className="h-2.5 w-16" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-3 w-2/3" />
        <SkeletonBlock className="h-5 w-20 mt-3" />
        <SkeletonBlock className="h-10 w-full mt-3" />
      </div>
    </div>
  );
}

export function SkeletonProductGrid({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-5 sm:gap-7">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}
