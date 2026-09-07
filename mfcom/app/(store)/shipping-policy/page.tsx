import { getSettings } from "@/lib/settings-store";
import { formatPrice } from "@/lib/utils";
import { SITE_URL } from "@/lib/site";
import PolicyPage from "@/components/storefront/PolicyPage";

export const metadata = {
  title: "Shipping & Service Policy",
  description: "How MF COM dispatches and delivers orders across Karachi and Pakistan.",
  alternates: { canonical: `${SITE_URL}/shipping-policy` },
};
export const dynamic = "force-dynamic"; // reads live settings

export default async function ShippingPolicyPage() {
  const settings = await getSettings();

  return (
    <PolicyPage eyebrow="Legal" title="Shipping & Service Policy" updated="September 2026">
      <h2>How ordering works</h2>
      <p>
        Add items to your cart and check out on the website. Every order is
        assigned an order number (e.g. MFC-10001) and confirmed with you directly
        over WhatsApp before it's dispatched — so you always speak to a real
        person before we send anything out.
      </p>

      <h2>Dispatch</h2>
      <p>
        Orders placed and confirmed before 4:00 PM are dispatched the same day,
        subject to stock availability. Orders confirmed after 4:00 PM go out the
        next business day. We dispatch via trusted local courier/rider partners
        (Bykea, Yango, InDrive) and share a live tracking link once your order is
        on its way — you can also track it any time on our{" "}
        <a href="/">order tracking page</a> using your order number.
      </p>

      <h2>Delivery area & timing</h2>
      <ul>
        <li>Karachi (in-city): typically same-day to next-day delivery.</li>
        <li>Other cities in Pakistan: typically 2–5 business days via courier, depending on location.</li>
        <li>Delivery times are estimates, not guarantees — weather, traffic, and courier availability can affect them.</li>
      </ul>

      <h2>Delivery charges</h2>
      <p>
        Delivery fees, when applicable, are shown at checkout before you confirm
        your order. Orders above {formatPrice(settings.freeDeliveryThreshold)}{" "}
        qualify for free delivery.
      </p>

      <h2>Payment</h2>
      <p>
        We currently accept cash on delivery and bank transfer, confirmed directly
        with our team over WhatsApp during order confirmation. We do not process
        card payments on the website.
      </p>

      <h2>Order tracking</h2>
      <p>
        Every order can be tracked using the order number we send you, on the{" "}
        <a href="/">order tracking page</a>, which shows real-time status from
        placed through dispatched to delivered.
      </p>

      <h2>Need help with an order?</h2>
      <p>
        Message us on WhatsApp at {settings.whatsappDisplay} or {settings.whatsappSecondaryDisplay},
        email {settings.email}, or visit us at {settings.address}.
      </p>
    </PolicyPage>
  );
}
