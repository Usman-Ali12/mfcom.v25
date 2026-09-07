"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProductImage from "@/components/storefront/ProductImage";
import { useRouter } from "next/navigation";
import { Minus, Plus, MessageCircle, Heart, Check } from "lucide-react";
import type { Product } from "@/lib/mock-data";
import { formatPrice, discountPercent, productWhatsAppLink } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

export default function ProductPurchasePanel({ product, whatsappNumber }: { product: Product; whatsappNumber: string }) {
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const discount = discountPercent(product.price, product.previousPrice);
  const { addItem } = useCart();
  const { toggle, isSaved } = useWishlist();
  const saved = isSaved(product.id);
  const router = useRouter();

  function handleAddToCart() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  function handleBuyNow() {
    addItem(product, qty);
    router.push("/checkout");
  }

  const outOfStock = product.stock === "out-of-stock";

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square bg-white dark:bg-graphite chamfer border border-line dark:border-white/10 overflow-hidden mb-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <ProductImage
                  src={product.gallery[activeImage]}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
            {discount && (
              <span className="absolute top-4 left-4 mono-label text-xs bg-red text-white px-2.5 py-1">
                −{discount}%
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {product.gallery.map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveImage(i)}
                className={`relative aspect-square chamfer-sm overflow-hidden border-2 transition-colors ${
                  activeImage === i ? "border-red" : "border-transparent"
                }`}
              >
                <ProductImage src={img} alt="" fill sizes="120px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info + purchase — sticky on desktop so it stays in view while
            scrolling a taller gallery, instead of running out of content
            early and leaving a blank gap below it (the actual cause of
            the "empty space" — this column is genuinely shorter than the
            image column for products with a brief description). Same
            pattern as Amazon's buy box. */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="mono-label text-xs text-steel mb-2">{product.brand}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-3 leading-tight dark:text-paper">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < Math.round(product.rating) ? "text-red" : "text-line dark:text-white/20"}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-steel">
              {product.rating} ({product.reviewCount} reviews)
            </span>
          </div>

          {/* Price — large, high-contrast, always visible (never hover-gated) */}
          <div className="flex items-baseline gap-3 mb-1">
            <span className="font-mono text-3xl font-bold text-void dark:text-paper">
              {formatPrice(product.price)}
            </span>
            {product.previousPrice && (
              <span className="font-mono text-lg text-steel line-through">
                {formatPrice(product.previousPrice)}
              </span>
            )}
          </div>

          <p
            className={`text-sm font-medium mb-6 ${
              product.stock === "low-stock" ? "text-red" : "text-steel"
            }`}
          >
            {product.stock === "in-stock" && `In stock — ${product.stockCount} available`}
            {product.stock === "low-stock" && `Only ${product.stockCount} left — order soon`}
            {product.stock === "out-of-stock" && "Out of stock"}
          </p>

          <p className="text-sm text-void/70 dark:text-paper/70 leading-relaxed mb-8 max-w-md">
            {product.description}
          </p>

          {/* Quantity + actions — hidden on mobile in favour of the sticky bar below */}
          <div className="hidden sm:flex items-center gap-3 mb-4">
            <div className="flex items-center border border-line dark:border-white/10 chamfer-sm h-12 dark:text-paper">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-11 h-full flex items-center justify-center hover:text-red transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center font-mono text-sm">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stockCount, q + 1))}
                className="w-11 h-full flex items-center justify-center hover:text-red transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={`flex-1 h-12 text-sm font-medium chamfer transition-colors flex items-center justify-center gap-2 ${
                added ? "bg-green-700 text-white" : "bg-void text-white hover:bg-red dark:bg-red dark:hover:bg-red-dim"
              }`}
            >
              {added ? (
                <>
                  <Check size={16} /> Added to cart
                </>
              ) : outOfStock ? (
                "Out of Stock"
              ) : (
                "Add to Cart"
              )}
            </button>
            <button
              onClick={() => toggle(product)}
              aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
              className={`w-12 h-12 border chamfer-sm flex items-center justify-center transition-colors ${
                saved
                  ? "bg-red border-red text-white"
                  : "border-line dark:border-white/10 hover:border-red hover:text-red dark:text-paper"
              }`}
            >
              <Heart size={18} className={saved ? "fill-current" : ""} />
            </button>
          </div>

          <div className="hidden sm:grid sm:grid-cols-2 gap-3 mb-8">
            <button
              onClick={handleBuyNow}
              disabled={outOfStock}
              className="h-12 bg-red text-white text-sm font-medium chamfer hover:bg-red-dim transition-colors disabled:opacity-50"
            >
              Buy Now
            </button>
            <a
              href={productWhatsAppLink(product, whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 flex items-center justify-center gap-2 border border-[#25D366] text-[#25D366] text-sm font-medium chamfer hover:bg-[#25D366]/10 transition-colors"
            >
              <MessageCircle size={16} /> Ask on WhatsApp
            </a>
          </div>

          <div className="border-t border-line dark:border-white/10 pt-6 space-y-2 text-sm text-void/70 dark:text-paper/70 mb-20 sm:mb-0">
            <p>Delivery: 2–4 business days, nationwide</p>
            <p>Warranty: {product.warranty}</p>
          </div>
        </div>
      </div>

      {/* Sticky mobile action bar — the primary conversion path on small screens */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-graphite border-t border-line dark:border-white/10 p-3 flex gap-2 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <a
          href={productWhatsAppLink(product, whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-12 shrink-0 flex items-center justify-center border border-[#25D366] text-[#25D366] chamfer-sm"
          aria-label="Ask on WhatsApp"
        >
          <MessageCircle size={18} />
        </a>
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={`flex-1 h-12 text-sm font-medium chamfer-sm transition-colors flex items-center justify-center gap-2 ${
            added ? "bg-green-700 text-white" : "bg-void dark:bg-graphite dark:border dark:border-white/20 text-white dark:text-paper"
          }`}
        >
          {added ? (
            <>
              <Check size={16} /> Added
            </>
          ) : outOfStock ? (
            "Out of Stock"
          ) : (
            "Add to Cart"
          )}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex-1 h-12 bg-red text-white text-sm font-medium chamfer-sm disabled:opacity-50"
        >
          Buy Now
        </button>
      </div>
    </>
  );
}
