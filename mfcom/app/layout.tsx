import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Preloader from "@/components/storefront/Preloader";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { ToastProvider } from "@/lib/toast-context";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Computer & Gaming Accessories, Karachi`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "MF COM deals in all kinds of computer accessories — branded and China accessories, gaming gear, and general order supply. Naz Plaza, M.A. Jinnah Road, Karachi.",
  icons: { icon: "/logo.png" },
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
  },
};

// Site-wide Organization schema — appears on every page via the root
// layout, rather than duplicated per-page. This is what lets search
// engines associate the site with the business name, logo, and contact
// info directly in results (knowledge panel eligibility).
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
};

// Theme boot script — reads the saved preference (light/dark/system) and
// applies the .dark class before first paint, so there's never a flash of
// the wrong theme. "system" resolves against the OS's prefers-color-scheme
// at boot time; ThemeToggle keeps it in sync if the OS setting changes
// while the tab is open.
const THEME_INIT_SCRIPT = `
try {
  var pref = localStorage.getItem('mfcom-theme') || 'light';
  var isDark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) document.documentElement.classList.add('dark');
} catch (e) {}
`;

// Preloader skip script — if this browser session already saw the full
// intro (sessionStorage flag), add a class to <html> synchronously,
// before hydration. globals.css hides #mfcom-preloader via plain CSS
// whenever that class is present, so repeat page loads within a session
// never flash the black overlay either — same technique as the theme
// boot script above, applied to the same class of problem.
const PRELOADER_SKIP_SCRIPT = `
try {
  if (sessionStorage.getItem('mfcom-intro-played')) {
    document.documentElement.classList.add('mfcom-skip-preloader');
  }
} catch (e) {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <Script id="preloader-skip" strategy="beforeInteractive">
          {PRELOADER_SKIP_SCRIPT}
        </Script>
        {/* Plain SSR'd script tag, not next/script — JSON-LD must be present
            in the initial server-rendered HTML for crawlers, not deferred
            until after hydration the way next/script's "afterInteractive"
            (or any client-executed strategy) would leave it. */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              {/* Preloader only plays on a cold first load — see component for the sessionStorage gate */}
              <Preloader />
              {children}
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
