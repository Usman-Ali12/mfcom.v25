"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, MessageCircle, Copy, Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { placeOrderAction } from "@/app/(store)/checkout/actions";

export default function CheckoutClient({
  whatsappNumber,
  freeDeliveryThreshold,
}: {
  whatsappNumber: string;
  freeDeliveryThreshold: number;
}) {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ orderNumber: string; whatsappUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const delivery = subtotal >= freeDeliveryThreshold ? 0 : 350;
  const total = subtotal + delivery;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim() || items.length === 0) return;
    setSubmitting(true);
    try {
      const result = await placeOrderAction({
        customerName: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          slug: i.product.slug,
          price: i.product.price,
          qty: i.qty,
        })),
        subtotal,
        delivery,
        total,
        whatsappNumber,
      });
      setPlacedOrder(result);
      clear();
      // Auto-open WhatsApp with the order pre-filled — this is the "order
      // details automatically sent to WhatsApp" step. Opened in a new tab
      // so the confirmation page (with the order number) stays visible.
      window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
    } finally {
      setSubmitting(false);
    }
  }

  function copyOrderNumber() {
    if (!placedOrder) return;
    navigator.clipboard.writeText(placedOrder.orderNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  // ---------------- Confirmation state ----------------
  if (placedOrder) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-20 text-center">
        <CheckCircle2 size={48} className="mx-auto mb-5 text-green-600" />
        <h1 className="font-display text-2xl font-semibold mb-2 dark:text-paper">Order placed</h1>
        <p className="text-sm text-steel mb-6">
          Your order number is below — save it to track your order. We've opened
          WhatsApp with your order details; hit send there to confirm with our team.
        </p>

        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="font-mono text-2xl font-bold text-red">{placedOrder.orderNumber}</span>
          <button
            onClick={copyOrderNumber}
            aria-label="Copy order number"
            className="p-2 text-steel hover:text-red transition-colors"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={placedOrder.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 px-6 flex items-center justify-center gap-2 bg-[#25D366] text-white text-sm font-medium chamfer hover:brightness-95 transition"
          >
            <MessageCircle size={16} /> Open WhatsApp again
          </a>
          <Link
            href={`/track/${placedOrder.orderNumber}`}
            className="h-12 px-6 flex items-center justify-center border border-line chamfer text-sm font-medium hover:bg-paper transition-colors dark:text-paper dark:border-white/10"
          >
            Track this order
          </Link>
        </div>
      </div>
    );
  }

  // ---------------- Empty cart state ----------------
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-24 text-center">
        <ShoppingBag size={40} className="mx-auto mb-4 text-steel" />
        <h1 className="font-display text-xl font-semibold mb-2 dark:text-paper">Your cart is empty</h1>
        <p className="text-sm text-steel mb-6">Add something to your cart before checking out.</p>
        <Link
          href="/shop"
          className="inline-flex h-11 px-6 items-center bg-void dark:bg-red text-white text-sm font-medium chamfer hover:bg-red dark:hover:bg-red-dim transition-colors"
        >
          Shop all products
        </Link>
      </div>
    );
  }

  // ---------------- Order form ----------------
  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-display-md font-semibold mb-8 dark:text-paper">Checkout</h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-medium block mb-1.5 dark:text-paper">Full name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3 border border-line dark:border-white/10 chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red bg-white dark:bg-graphite dark:text-paper"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5 dark:text-paper">Phone number *</label>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03XX-XXXXXXX"
              className="w-full h-11 px-3 border border-line dark:border-white/10 chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red bg-white dark:bg-graphite dark:text-paper font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5 dark:text-paper">Delivery address *</label>
            <textarea
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2.5 border border-line dark:border-white/10 chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red bg-white dark:bg-graphite dark:text-paper"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5 dark:text-paper">Notes (optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. preferred delivery time"
              className="w-full px-3 py-2.5 border border-line dark:border-white/10 chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red bg-white dark:bg-graphite dark:text-paper"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 bg-red text-white text-sm font-medium chamfer hover:bg-red-dim transition-colors disabled:opacity-60"
          >
            {submitting ? "Placing order…" : "Place order via WhatsApp"}
          </button>
          <p className="text-xs text-steel text-center">
            We'll open WhatsApp with your order pre-filled — hit send there to confirm with our team.
          </p>
        </form>

        {/* Order summary */}
        <div className="h-fit bg-white dark:bg-graphite border border-line dark:border-white/10 chamfer p-6">
          <h2 className="font-display text-lg font-semibold mb-5 dark:text-paper">Order Summary</h2>
          <div className="space-y-3 mb-5 max-h-64 overflow-y-auto thin-scroll">
            {items.map(({ product, qty }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="text-void/80 dark:text-paper/80">
                  {qty}x {product.name}
                </span>
                <span className="font-mono shrink-0 ml-2">{formatPrice(product.price * qty)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-t border-line dark:border-white/10 pt-4 mb-3">
            <div className="flex justify-between">
              <span className="text-steel">Subtotal</span>
              <span className="font-mono">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-steel">Delivery</span>
              <span className="font-mono">{delivery === 0 ? "Free" : formatPrice(delivery)}</span>
            </div>
          </div>
          <div className="flex justify-between items-baseline border-t border-line dark:border-white/10 pt-4">
            <span className="font-medium dark:text-paper">Total</span>
            <span className="font-mono text-xl font-semibold dark:text-paper">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
