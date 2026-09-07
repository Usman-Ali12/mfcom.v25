"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Menu, X, ChevronRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import ThemeToggle from "@/components/storefront/ThemeToggle";
import TrackOrderQuickEntry from "@/components/storefront/TrackOrderQuickEntry";
import SearchBox from "@/components/storefront/SearchBox";

export default function Header({
  whatsappDisplay,
  categoryGroups,
}: {
  whatsappDisplay: string;
  categoryGroups: { group: string; items: string[] }[];
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();

  // Cart-icon bump — a small, real micro-interaction (not decoration): it
  // confirms the add actually registered, the same instinct behind Jarir's
  // responsive-feeling UI even before anything else on the page changes.
  const [cartBump, setCartBump] = useState(false);
  const prevCount = useRef(count);
  useEffect(() => {
    if (count > prevCount.current) {
      setCartBump(true);
      const t = setTimeout(() => setCartBump(false), 400);
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  // Same bump for wishlist — its only home now is a small icon buried in the
  // desktop row, so the add needs to register just as clearly as cart does.
  const [wishlistBump, setWishlistBump] = useState(false);
  const prevWishlistCount = useRef(wishlistCount);
  useEffect(() => {
    if (wishlistCount > prevWishlistCount.current) {
      setWishlistBump(true);
      const t = setTimeout(() => setWishlistBump(false), 400);
      return () => clearTimeout(t);
    }
    prevWishlistCount.current = wishlistCount;
  }, [wishlistCount]);

  return (
    <>
      <div className="bg-void text-paper/70 text-xs mono-label py-2 px-4 flex items-center justify-center gap-4 relative">
        <span className="text-center">
          Free delivery in Karachi on orders over Rs. 15,000 · Naz Plaza, M.A. Jinnah Road · Call {whatsappDisplay}
        </span>
        <span className="absolute right-4 hidden lg:block">
          <TrackOrderQuickEntry />
        </span>
      </div>

      <header className="sticky top-0 z-50 bg-void text-paper border-b border-white/10">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-[76px] items-center gap-6">
            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 -ml-2"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link href="/" className="shrink-0 flex items-center" aria-label="MF COM home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-on-dark.png" alt="MF COM" className="h-10 w-auto" />
            </Link>

            {/* Categories trigger (desktop) */}
            <div
              className="hidden lg:block relative"
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                className="flex items-center gap-2 h-[76px] px-1 text-sm font-medium tracking-wide"
                aria-expanded={menuOpen}
              >
                <span className="w-4 h-[2px] bg-red inline-block" />
                CATEGORIES
              </button>

              {/* Mega menu */}
              {menuOpen && (
                <div className="absolute left-0 top-full w-[720px] bg-void border border-white/10 border-t-2 border-t-red shadow-2xl">
                  <div className="grid grid-cols-3 gap-x-8 gap-y-6 p-8">
                    {categoryGroups.map((group) => (
                      <div key={group.group}>
                        <p className="mono-label text-[11px] text-red mb-3">{group.group}</p>
                        <ul className="space-y-2.5">
                          {group.items.map((item) => (
                            <li key={item}>
                              <Link
                                href={`/category/${item.toLowerCase().replace(/\s+/g, "-")}`}
                                className="text-sm text-paper/85 hover:text-red transition-colors"
                              >
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/deals"
                    className="flex items-center justify-between px-8 py-4 bg-red/10 text-red text-sm font-medium hover:bg-red/15 transition-colors"
                  >
                    View this week's deals
                    <ChevronRight size={16} />
                  </Link>
                </div>
              )}
            </div>

            {/* Search — predictive suggestions as you type */}
            <div className="hidden md:flex flex-1 max-w-md">
              <SearchBox variant="desktop" />
            </div>

            <div className="flex items-center gap-1 ml-auto">
              <ThemeToggle />
              <Link
                href="/wishlist"
                className="hidden lg:flex p-2.5 hover:text-red transition-colors relative items-center justify-center"
                aria-label="Wishlist"
              >
                <motion.div animate={wishlistBump ? { scale: [1, 1.35, 1] } : {}} transition={{ duration: 0.4, ease: "easeOut" }}>
                  <Heart size={20} />
                </motion.div>
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red text-[10px] leading-none w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="p-2.5 hover:text-red transition-colors relative" aria-label="Cart">
                <motion.div animate={cartBump ? { scale: [1, 1.35, 1] } : {}} transition={{ duration: 0.4, ease: "easeOut" }}>
                  <ShoppingCart size={20} />
                </motion.div>
                {count > 0 && (
                  <span className="absolute top-1 right-1 bg-red text-[10px] leading-none w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                    {count}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile search — always visible, not hidden behind a menu (Jarir-style: search must be one tap away), with predictive suggestions */}
          <div className="md:hidden pb-3">
            <SearchBox variant="mobile" />
          </div>
        </div>
      </header>

      {/* Cart recovery nudge — only real information (their own cart count),
          shown only when relevant, dismissible by just going to the cart. */}
      {count > 0 && pathname !== "/cart" && (
        <Link
          href="/cart"
          className="block bg-red/10 dark:bg-red/15 text-red text-xs sm:text-sm text-center py-2 px-4 hover:bg-red/15 dark:hover:bg-red/20 transition-colors"
        >
          You have {count} {count === 1 ? "item" : "items"} waiting in your cart — resume checkout →
        </Link>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-void text-paper overflow-y-auto thin-scroll pt-[76px]">
          <div className="p-6 space-y-8">
            <Link
              href="/wishlist"
              className="flex items-center justify-between text-base py-1"
              onClick={() => setMobileOpen(false)}
            >
              <span className="flex items-center gap-3">
                <Heart size={18} />
                Wishlist
              </span>
              {wishlistCount > 0 && (
                <span className="bg-red text-[10px] leading-none w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {categoryGroups.map((group) => (
              <div key={group.group}>
                <p className="mono-label text-[11px] text-red mb-3">{group.group}</p>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={item}>
                      <Link
                        href={`/category/${item.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-base"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}