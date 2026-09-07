import type { Config } from "tailwindcss";

// ---------------------------------------------------------------------------
// MF COM design tokens
// The palette is sampled from the client logo (void black + circuit red).
// Corners are chamfered (clip-path), never fully rounded — this is the visual
// echo of the logo's angular mountain-peak "M" mark, used everywhere instead
// of the generic 24px-rounded-card look.
// ---------------------------------------------------------------------------

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0B0B0C",       // primary dark foundation (header, footer, promo)
        graphite: "#17171B",   // secondary dark surface, cards-on-black
        steel: "#6E6E73",      // muted text, borders, disabled states
        paper: "#F4F4F2",      // off-white surface, product photography backdrop
        line: "#E4E3DE",       // hairline dividers on paper
        red: {
          DEFAULT: "#E2231A", // circuit red — CTAs, price, discount, active state
          dim: "#B31912",
          glow: "#FF4438",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "0.98", letterSpacing: "-0.02em" }],
        "display-lg": ["3rem", { lineHeight: "1.0", letterSpacing: "-0.015em" }],
        "display-md": ["2rem", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
      },
      clipPath: {
        chamfer: "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
      },
      boxShadow: {
        crisp: "0 1px 0 0 rgba(11,11,12,0.06)",
      },
      transitionTimingFunction: {
        snap: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [
    // chamfer utility plugin
    function ({ addUtilities }: any) {
      addUtilities({
        ".chamfer": {
          clipPath:
            "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
        },
        ".chamfer-sm": {
          clipPath:
            "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
        },
        ".chamfer-lg": {
          clipPath:
            "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
        },
      });
    },
  ],
};

export default config;
