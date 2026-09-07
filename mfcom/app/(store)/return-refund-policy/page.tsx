import { getSettings } from "@/lib/settings-store";
import { SITE_URL } from "@/lib/site";
import PolicyPage from "@/components/storefront/PolicyPage";

export const metadata = {
  title: "Return & Refund Policy",
  description: "MF COM's return, exchange, and refund policy — 7-day change-of-mind returns and warranty support.",
  alternates: { canonical: `${SITE_URL}/return-refund-policy` },
};
export const dynamic = "force-dynamic"; // reads live settings

export default async function ReturnRefundPolicyPage() {
  const settings = await getSettings();

  return (
    <PolicyPage eyebrow="Legal" title="Return & Refund Policy" updated="September 2026">
      <h2>7-day change-of-mind returns</h2>
      <p>
        If you change your mind, you can return an item within <strong>7 days</strong>{" "}
        of delivery, provided it is:
      </p>
      <ul>
        <li>Unopened and unused, in its original packaging with all accessories and manuals.</li>
        <li>Accompanied by your order number or receipt.</li>
        <li>Not a category excluded below.</li>
      </ul>

      <h2>Damaged, defective, or wrong item</h2>
      <p>
        If your order arrives damaged, defective, or different from what you
        ordered, contact us on WhatsApp within 48 hours of delivery with photos of
        the item and packaging. We'll arrange a free replacement, repair, or refund —
        whichever applies.
      </p>

      <h2>Manufacturer warranty</h2>
      <p>
        Most electronics we sell carry a manufacturer warranty (see the individual
        product page or your invoice for the exact term — up to 3 years on select
        electronics). Warranty claims after the 7-day return window are handled
        through the manufacturer's local service process; we'll guide you through it.
      </p>

      <h2>What's not eligible for change-of-mind return</h2>
      <ul>
        <li>Items that have been opened, installed, or show signs of use (cables, adapters, consumables).</li>
        <li>Items missing original packaging, accessories, or proof of purchase.</li>
        <li>Custom/special-order items sourced specifically for your request.</li>
      </ul>

      <h2>How to start a return</h2>
      <p>
        Message us on WhatsApp at {settings.whatsappDisplay} with your order number
        and reason for return, or bring the item to our shop at {settings.address}.
        We'll confirm eligibility and next steps.
      </p>

      <h2>Refunds</h2>
      <p>
        Approved refunds are issued the same way you paid — bank transfer/cash
        refund for cash-on-delivery or bank-transfer orders. Refunds are typically
        processed within 3–5 business days once we receive and inspect the
        returned item.
      </p>
    </PolicyPage>
  );
}
