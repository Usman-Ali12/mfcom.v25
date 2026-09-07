"use client";

import Link from "next/link";
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

export default function CartPageClient({ whatsappNumber }: { whatsappNumber: string }) {
  const { items, setQty, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-24 text-center">
        <ShoppingBag size={40} className="mx-auto mb-4 text-steel" />
        <h1 className="font-display text-xl font-semibold mb-2">Your cart is empty</h1>
        <p className="text-sm text-steel mb-6">Browse the catalog to find something for your setup.</p>
        <Link
          href="/shop"
          className="inline-flex h-11 px-6 items-center bg-void text-white text-sm font-medium chamfer hover:bg-red transition-colors"
        >
          Shop all products
        </Link>
      </div>
    );
  }

  const delivery = subtotal >= 15000 ? 0 : 350;
  const total = subtotal + delivery;

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-display-md font-semibold mb-8">Your Cart</h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-10">
        {/* Line items */}
        <div className="divide-y divide-line dark:divide-white/10 border-y border-line dark:border-white/10">
          {items.map(({ product, qty }) => (
            <div key={product.id} className="flex gap-4 py-5">
              <Link href={`/product/${product.slug}`} className="w-24 h-24 shrink-0 bg-paper dark:bg-void chamfer-sm overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="mono-label text-[10px] text-steel mb-1">{product.brand}</p>
                    <Link href={`/product/${product.slug}`} className="text-sm font-medium hover:text-red transition-colors">
                      {product.name}
                    </Link>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    aria-label={`Remove ${product.name} from cart`}
                    className="text-steel hover:text-red transition-colors shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex items-end justify-between mt-3">
                  <div className="flex items-center border border-line dark:border-white/10 chamfer-sm h-9 dark:text-paper">
                    <button
                      onClick={() => setQty(product.id, qty - 1)}
                      className="w-9 h-full flex items-center justify-center hover:text-red transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center font-mono text-sm">{qty}</span>
                    <button
                      onClick={() => setQty(product.id, qty + 1)}
                      className="w-9 h-full flex items-center justify-center hover:text-red transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="font-mono text-sm font-semibold">
                    {formatPrice(product.price * qty)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="h-fit bg-white dark:bg-graphite border border-line dark:border-white/10 chamfer p-6 dark:text-paper">
          <h2 className="font-display text-lg font-semibold mb-5">Order Summary</h2>
          <div className="space-y-3 text-sm mb-5">
            <div className="flex justify-between">
              <span className="text-steel">Subtotal</span>
              <span className="font-mono">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-steel">Delivery</span>
              <span className="font-mono">{delivery === 0 ? "Free" : formatPrice(delivery)}</span>
            </div>
          </div>
          <div className="flex justify-between items-baseline border-t border-line pt-4 mb-6">
            <span className="font-medium">Total</span>
            <span className="font-mono text-xl font-semibold">{formatPrice(total)}</span>
          </div>

          <Link
            href="/checkout"
            className="w-full h-12 flex items-center justify-center gap-2 bg-red text-white text-sm font-medium chamfer hover:bg-red-dim transition mb-2"
          >
            Checkout <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-steel text-center">
            Enter your details, then confirm the order with our team on WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
