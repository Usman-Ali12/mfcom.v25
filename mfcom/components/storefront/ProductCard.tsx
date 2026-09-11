"use client";

import Link from "next/link";
import ProductImage from "@/components/storefront/ProductImage";
import { Heart, Eye, Star, Check } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/lib/mock-data";
import { formatPrice, discountPercent } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

export default function ProductCard({ product }: { product: Product }) {
  const discount = discountPercent(product.price, product.previousPrice);
  const { addItem } = useCart();
  const { toggle, isSaved } = useWishlist();
  const [added, setAdded] = useState(false);
  const saved = isSaved(product.id);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    toggle(product);
  }

  return (
    <div className="group relative bg-white dark:bg-graphite chamfer border border-line dark:border-white/10 hover:border-void/20 dark:hover:border-white/25 transition-colors">
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-paper dark:bg-void/40">
        <ProductImage
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 ease-snap group-hover:scale-[1.045]"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.condition === "used" && (
            <span className="mono-label text-[10px] bg-amber-600 text-white px-2 py-1">
              Used
            </span>
          )}
          {product.badge && (
            <span className="mono-label text-[10px] bg-void text-paper px-2 py-1">
              {product.badge}
            </span>
          )}
          {discount && (
            <span className="mono-label text-[10px] bg-red text-white px-2 py-1">
              −{discount}%
            </span>
          )}
        </div>

        {/* Quick actions — always visible on touch devices (no hover there
            to reveal them), hover-reveal only as a progressive enhancement
            on devices with a real pointer (md+ and up). */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
          <button
            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleWishlist}
            className={`press w-9 h-9 flex items-center justify-center chamfer-sm transition-colors ${
              saved ? "bg-red text-white" : "bg-white/95 hover:bg-red hover:text-white"
            }`}
          >
            <Heart size={16} className={saved ? "fill-current" : ""} />
          </button>
          <button
            aria-label="Quick view"
            onClick={(e) => e.preventDefault()}
            className="w-9 h-9 bg-white/95 flex items-center justify-center chamfer-sm hover:bg-void hover:text-white transition-colors"
          >
            <Eye size={16} />
          </button>
        </div>

        {product.stock === "low-stock" && (
          <div className="absolute bottom-0 inset-x-0 bg-red/90 text-white text-[11px] mono-label text-center py-1">
            Only a few left
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="mono-label text-[10px] text-steel mb-1">{product.brand}</p>
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium leading-snug mb-1 hover:text-red transition-colors line-clamp-2 dark:text-paper">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-steel mb-3 line-clamp-1">{product.shortSpec}</p>

        <div className="flex items-center gap-1 mb-3">
          <Star size={12} className="fill-red text-red" />
          <span className="text-xs font-medium dark:text-paper">{product.rating}</span>
          <span className="text-xs text-steel">({product.reviewCount})</span>
        </div>

        {/* Price is always shown at full weight — never gated behind hover,
            since it's the single most decision-relevant fact on the card. */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-mono text-lg font-bold text-void dark:text-paper">
            {formatPrice(product.price)}
          </span>
          {product.previousPrice && (
            <span className="font-mono text-xs text-steel line-through">
              {formatPrice(product.previousPrice)}
            </span>
          )}
        </div>

        <button
          className={`press w-full h-10 text-sm font-medium chamfer-sm transition-colors flex items-center justify-center gap-2 overflow-hidden ${
            added
              ? "bg-green-700 text-white"
              : "bg-void text-white hover:bg-red dark:bg-red dark:hover:bg-red-dim"
          }`}
          onClick={handleAdd}
          disabled={product.stock === "out-of-stock"}
        >
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span
                key="added"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-2"
              >
                <Check size={15} /> Added
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                {product.stock === "out-of-stock" ? "Out of Stock" : "Add to Cart"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
