"use client";

import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

export type SelectOption = { value: string; label: string };

/**
 * Custom-styled select, replacing every native <select> site-wide (native
 * dropdowns can't be restyled past the browser's own rendering of the
 * open option list, no matter the CSS).
 *
 * The dropdown list renders through a React portal into document.body,
 * positioned via getBoundingClientRect of the trigger button — not as a
 * normal absolutely-positioned child. This matters because several forms
 * wrap their sections in the site's `.chamfer` utility class, which uses
 * clip-path — and clip-path clips ALL descendant rendering to the
 * element's box, including children positioned absolutely relative to a
 * nested ancestor. A dropdown positioned that way would get silently cut
 * off whenever it extended past the chamfered section's edge (exactly
 * what was happening to the Stock state field, positioned low in its
 * section). Portaling to body sidesteps that entirely — the same
 * technique shadcn/Radix components use for exactly this reason.
 */
export default function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  className = "w-full",
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX, width: rect.width });
  }, [open]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onReposition() {
      if (!open || !triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX, width: rect.width });
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`h-10 px-3 flex items-center justify-between gap-2 border border-line dark:border-white/10 chamfer-sm text-sm bg-white dark:bg-graphite dark:text-paper outline-none focus:ring-1 focus:ring-red hover:border-void/30 dark:hover:border-white/25 transition-colors ${className}`}
      >
        <span className={current ? "" : "text-steel"}>{current?.label ?? placeholder}</span>
        <ChevronDown size={15} className={`text-steel shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {mounted && open &&
        createPortal(
          <ul
            ref={listRef}
            role="listbox"
            style={{ position: "absolute", top: coords.top, left: coords.left, width: coords.width }}
            className="z-[1000] bg-white dark:bg-graphite border border-line dark:border-white/10 chamfer-sm shadow-xl py-1 max-h-64 overflow-y-auto thin-scroll"
          >
            {options.map((opt) => (
              <li key={opt.value} role="option" aria-selected={opt.value === value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors ${
                    opt.value === value
                      ? "text-red font-medium bg-red/5"
                      : "text-void dark:text-paper/85 hover:bg-paper dark:hover:bg-white/5"
                  }`}
                >
                  {opt.label}
                  {opt.value === value && <Check size={14} />}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </>
  );
}
