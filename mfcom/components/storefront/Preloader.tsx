"use client";

import { useEffect, useState } from "react";

/**
 * Brand preloader: LOGO -> RED FILL -> FULLY FILLED LOGO -> WEBSITE.
 *
 * Real fix in this pass: the previous version defaulted to an "idle"
 * state rendered at opacity-0, which is what the server sends in the
 * initial HTML — meaning real page content was visible FIRST, and the
 * black logo overlay only faded in after React hydrated and a useEffect
 * fired. That's backwards. This version's default render (the actual
 * SSR output, before any JS runs) is the FULLY OPAQUE overlay — the logo
 * is what's on screen from the very first painted frame, no JS required
 * for that initial visibility. Entrance is a pure-CSS animation
 * (`preloader-enter`) that plays automatically on paint, not something
 * gated behind React state.
 *
 * Repeat loads within the same browser session skip it instantly and
 * invisibly: an inline synchronous script in the root layout
 * (PRELOADER_SKIP_SCRIPT) runs before hydration and adds a class to
 * <html> that a plain CSS rule (globals.css) uses to hide this element
 * via display:none — so even the "skip" case never flashes anything,
 * the same technique already used for the dark/light theme boot.
 */
export default function Preloader() {
  const [state, setState] = useState<"showing" | "exiting" | "hidden">("showing");

  useEffect(() => {
    if (document.documentElement.classList.contains("mfcom-skip-preloader")) {
      setState("hidden"); // already hidden via CSS before this even runs — just stop rendering it
      return;
    }
    const holdTimer = setTimeout(() => {
      sessionStorage.setItem("mfcom-intro-played", "1");
      setState("exiting");
    }, 1600);
    return () => clearTimeout(holdTimer);
  }, []);

  useEffect(() => {
    if (state !== "exiting") return;
    const t = setTimeout(() => setState("hidden"), 400);
    return () => clearTimeout(t);
  }, [state]);

  if (state === "hidden") return null;

  return (
    <div
      id="mfcom-preloader"
      aria-hidden="true"
      className={`fixed inset-0 z-[999] flex items-center justify-center bg-void transition-opacity duration-400 ease-snap ${
        state === "exiting" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative w-[340px] sm:w-[460px] animate-[preloader-enter_500ms_cubic-bezier(0.16,1,0.3,1)_both]">
        {/* dim outline, always visible */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-silhouette.png" alt="" className="w-full opacity-[0.22]" />
        {/* red fill, wipes upward via animated clip-path, then pulses gently */}
        <img
          src="/logo-red.png"
          alt="MF COM"
          className="absolute inset-0 w-full animate-[fillwipe_700ms_cubic-bezier(0.65,0,0.35,1)_150ms_both,pulse-glow_1400ms_ease-in-out_900ms_infinite]"
        />
        {/* thin energy sweep passing through once filled */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -inset-y-4 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-red-glow/70 to-transparent animate-[sweep_600ms_ease-out_820ms_both]" />
        </div>
      </div>

      <style>{`
        @keyframes preloader-enter {
          from { transform: scale(0.9); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes fillwipe {
          from { clip-path: inset(100% 0 0 0); opacity: 0.4; filter: drop-shadow(0 0 0 rgba(226,35,26,0)); }
          60% { opacity: 1; }
          to   { clip-path: inset(0 0 0 0); opacity: 1; filter: drop-shadow(0 0 24px rgba(226,35,26,0.35)); }
        }
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 24px rgba(226,35,26,0.35)); }
          50% { filter: drop-shadow(0 0 40px rgba(226,35,26,0.6)); }
        }
        @keyframes sweep {
          from { transform: translateX(-40%) rotate(12deg); opacity: 0; }
          30%  { opacity: 1; }
          to   { transform: translateX(340%) rotate(12deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
