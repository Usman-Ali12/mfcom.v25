"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Companion to Preloader.tsx: that component owns the full brand moment
 * (logo fill) on first load only. This one is deliberately lighter — a
 * quick blur wash plus a slim top progress bar on every subsequent
 * navigation, not a repeat of the full logo animation. Repeating the
 * heavy version on every single click made browsing feel slower rather
 * than more polished; a brief blur + bar reads as "smooth" without that
 * cost.
 *
 * Still a CURTAIN, not a real loading blocker — Next.js has already
 * fetched the destination page by the time this fires. Click interception
 * (capture phase, before Next's own <Link> handler runs) means the blur
 * appears right as the click happens, not after the new page is already
 * visible underneath.
 */
const HOLD_MS = 220; // brief — a wash, not a wait
const SAFETY_TIMEOUT_MS = 3000; // auto-hide if navigation never completes (e.g. blocked/cancelled)

export default function RouteTransitionOverlay() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const isFirstRender = useRef(true);
  const shownAt = useRef(0);
  const safetyTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!visible) return; // pathname changed without our click handler (e.g. programmatic router.push) — nothing to reveal
    clearTimeout(safetyTimer.current);
    const elapsed = Date.now() - shownAt.current;
    const remaining = Math.max(0, HOLD_MS - elapsed);
    const t = setTimeout(() => setVisible(false), remaining);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      if (!href.startsWith("/") || href.startsWith("//")) return; // external/protocol links
      if (anchor.target === "_blank") return;
      if (href === pathname) return; // already here

      shownAt.current = Date.now();
      setVisible(true);
      clearTimeout(safetyTimer.current);
      safetyTimer.current = setTimeout(() => setVisible(false), SAFETY_TIMEOUT_MS);
    }
    // Capture phase — see file header for why this matters vs bubble.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  return (
    <>
      {/* Slim top progress bar — the "is something happening" cue right at
          the very top edge of the viewport, above the header. */}
      <div
        aria-hidden="true"
        className={`fixed top-0 left-0 right-0 z-[1000] h-[3px] bg-red shadow-[0_0_8px_rgba(226,35,26,0.6)] transition-[width,opacity] ease-out ${
          visible
            ? "w-[92%] opacity-100 duration-[220ms]"
            : "w-full opacity-0 duration-[200ms] delay-100"
        }`}
      />
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-[998] backdrop-blur-md bg-white/40 dark:bg-void/40 transition-opacity duration-200 ease-out ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
    </>
  );
}
