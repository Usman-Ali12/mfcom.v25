"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import ProductCard from "@/components/storefront/ProductCard";
import { useWishlist } from "@/lib/wishlist-context";

export const dynamic = "force-dynamic"; // the shared store layout now reads live categories from Supabase

export default function WishlistPage() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-24 text-center">
        <Heart size={40} className="mx-auto mb-4 text-steel" />
        <h1 className="font-display text-xl font-semibold mb-2 dark:text-paper">Your wishlist is empty</h1>
        <p className="text-sm text-steel mb-6">Tap the heart on any product to save it for later.</p>
        <Link
          href="/shop"
          className="inline-flex h-11 px-6 items-center bg-void dark:bg-red text-white text-sm font-medium chamfer hover:bg-red dark:hover:bg-red-dim transition-colors"
        >
          Shop all products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-display-md font-semibold mb-8 dark:text-paper">
        Your Wishlist ({items.length})
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
