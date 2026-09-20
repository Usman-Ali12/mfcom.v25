"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Rebuilt on Embla — the same carousel engine shadcn/ui's <Carousel>
// component wraps — rather than a raw overflow-x-auto div with a native
// scrollbar. Styled to match this site's existing design system (chamfer
// corners, void/red palette, the .press tap feedback already used
// everywhere else) instead of pulling in shadcn's own Button/cva/
// tailwind-merge utilities, which would introduce a second, different
// styling language into a codebase that already has its own.
//
// No visible scrollbar at all now: the viewport clips overflow, arrow
// buttons and dots are the only navigation, and drag/swipe still works
// (Embla's default behavior) for anyone who'd rather flick through on
// mobile.
export default function Carousel({ children }: { children: React.ReactNode }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((api: NonNullable<typeof emblaApi>) => {
    setSelectedIndex(api.selectedScrollSnap());
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative group/carousel">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 sm:gap-6">{children}</div>
      </div>

      {canScrollPrev && (
        <button
          onClick={() => emblaApi?.scrollPrev()}
          aria-label="Previous"
          className="press hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-1/2 w-10 h-10 items-center justify-center bg-white dark:bg-graphite border border-line dark:border-white/10 chamfer-sm shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-paper dark:hover:bg-white/5 dark:text-paper"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      {canScrollNext && (
        <button
          onClick={() => emblaApi?.scrollNext()}
          aria-label="Next"
          className="press hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-1/2 w-10 h-10 items-center justify-center bg-white dark:bg-graphite border border-line dark:border-white/10 chamfer-sm shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-paper dark:hover:bg-white/5 dark:text-paper"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {scrollSnaps.length > 1 && (
        <div className="flex items-center justify-center gap-1 mt-5">
          {scrollSnaps.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="press p-2 -m-0.5"
            >
              <span
                className={`block h-2.5 chamfer-sm transition-all ${
                  i === selectedIndex
                    ? "w-8 bg-red"
                    : "w-2.5 bg-line dark:bg-white/20 hover:bg-steel dark:hover:bg-white/40"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
