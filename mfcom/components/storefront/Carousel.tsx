"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Carousel({ children }: { children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateArrows() {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  function scrollByCard(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-item]");
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  }

  return (
    <div className="relative group/carousel">
      {/* Arrow controls — desktop only (mouse users benefit; touch users swipe naturally) */}
      {canScrollLeft && (
        <button
          onClick={() => scrollByCard(-1)}
          aria-label="Scroll left"
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-1/2 w-10 h-10 items-center justify-center bg-white border border-line chamfer-sm shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-paper"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scrollByCard(1)}
          aria-label="Scroll right"
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-1/2 w-10 h-10 items-center justify-center bg-white border border-line chamfer-sm shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-paper"
        >
          <ChevronRight size={18} />
        </button>
      )}

      <div
        ref={trackRef}
        className="flex gap-5 sm:gap-7 overflow-x-auto snap-x snap-mandatory thin-scroll pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: "thin" }}
      >
        {children}
      </div>
    </div>
  );
}
