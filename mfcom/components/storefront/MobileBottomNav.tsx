"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3x3, Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";

const ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: Grid3x3 },
  { href: "/search", label: "Search", icon: Search },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { count } = useCart();

  // Product detail pages have their own richer sticky action bar
  // (Add to Cart / Buy Now / WhatsApp specific to that product) — showing
  // both would stack two fixed bottom bars on top of each other.
  if (pathname.startsWith("/product/")) return null;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-graphite border-t border-line dark:border-white/10 flex items-stretch h-14 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      {ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors ${
              active ? "text-red" : "text-steel"
            }`}
          >
            <span className="relative">
              <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
              {item.href === "/cart" && count > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red text-white text-[9px] leading-none w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                  {count}
                </span>
              )}
            </span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
