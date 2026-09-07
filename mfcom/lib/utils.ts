import type { Product } from "./mock-data";

export function formatPrice(value: number, currency: "PKR" = "PKR") {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function discountPercent(price: number, previousPrice?: number) {
  if (!previousPrice || previousPrice <= price) return null;
  return Math.round(((previousPrice - price) / previousPrice) * 100);
}

// whatsappNumber is now a required parameter rather than a hardcoded
// constant — it comes from SiteSettings (lib/settings-store.ts) via a
// server component, so an admin can change the number in /admin/settings
// and every WhatsApp link on the site picks it up without a redeploy.
export function productWhatsAppLink(
  product: Product,
  whatsappNumber: string,
  siteUrl = "https://mfcom.pk"
) {
  const message = [
    `Hi, I'm interested in:`,
    ``,
    product.name,
    ``,
    `Price: ${formatPrice(product.price)}`,
    ``,
    `Product:`,
    `${siteUrl}/product/${product.slug}`,
  ].join("\n");
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function cartWhatsAppLink(
  items: { product: Product; qty: number }[],
  whatsappNumber: string,
  siteUrl = "https://mfcom.pk"
) {
  const lines = items.map(
    (i) => `${i.qty}x ${i.product.name} — ${formatPrice(i.product.price * i.qty)}`
  );
  const total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const message = [
    `Hi, I'd like to order:`,
    ``,
    ...lines,
    ``,
    `Total: ${formatPrice(total)}`,
    ``,
    `${siteUrl}/cart`,
  ].join("\n");
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
