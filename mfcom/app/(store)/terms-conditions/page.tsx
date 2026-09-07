import { getSettings } from "@/lib/settings-store";
import { SITE_URL } from "@/lib/site";
import PolicyPage from "@/components/storefront/PolicyPage";

export const metadata = {
  title: "Terms & Conditions",
  description: "The terms that apply when you use the MF COM website and place an order.",
  alternates: { canonical: `${SITE_URL}/terms-conditions` },
};
export const dynamic = "force-dynamic"; // reads live settings

export default async function TermsConditionsPage() {
  const settings = await getSettings();

  return (
    <PolicyPage eyebrow="Legal" title="Terms & Conditions" updated="September 2026">
      <p>
        These terms govern your use of this website and any order you place
        with MF COM. By browsing this site or placing an order, you agree to them.
      </p>

      <h2>About us</h2>
      <p>
        MF COM is a computer and gaming accessories retailer based at {settings.address}.
        You can reach us at {settings.whatsappDisplay} or {settings.email}.
      </p>

      <h2>Products & pricing</h2>
      <ul>
        <li>We aim to keep product information, images, and pricing accurate, but errors can occur — we'll contact you before processing an order affected by a pricing or listing error.</li>
        <li>Prices are listed in Pakistani Rupees (PKR) and may change without prior notice.</li>
        <li>Product availability is subject to stock on hand at the time of order confirmation.</li>
      </ul>

      <h2>Orders</h2>
      <p>
        Placing an order on the website is a request to buy, not a final sale —
        every order is confirmed with you over WhatsApp before dispatch. We
        reserve the right to decline or cancel an order (e.g. stock unavailable,
        pricing error, suspected fraud), in which case we'll let you know and
        issue any refund due.
      </p>

      <h2>Payment</h2>
      <p>
        We accept cash on delivery and bank transfer, arranged directly with our
        team. Full payment (or agreed arrangement) is required before an order is
        marked complete.
      </p>

      <h2>Shipping & returns</h2>
      <p>
        See our <a href="/shipping-policy">Shipping & Service Policy</a> and{" "}
        <a href="/return-refund-policy">Return & Refund Policy</a> for delivery
        timelines and how to return or exchange an item.
      </p>

      <h2>Warranty</h2>
      <p>
        Products carry the manufacturer's warranty where stated on the product
        page or invoice. MF COM facilitates warranty claims through the relevant
        manufacturer or distributor but is not the warranty issuer unless stated otherwise.
      </p>

      <h2>Website use</h2>
      <p>
        You agree not to misuse this website — including attempting to disrupt
        it, scrape it at scale, or place fraudulent orders. Content on this site
        (logo, product photography, and text) belongs to MF COM or its licensors
        and may not be reused without permission.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        We work to keep this site accurate and available, but we don't guarantee
        it will be error-free or uninterrupted at all times. To the extent
        permitted by law, MF COM isn't liable for indirect or consequential
        losses arising from use of the site.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms from time to time; the "last updated" date
        above reflects the latest version. Continued use of the site after a
        change means you accept the updated terms.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of Pakistan.</p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Reach us at{" "}
        <a href={`mailto:${settings.email}`}>{settings.email}</a> or on WhatsApp at{" "}
        {settings.whatsappDisplay}.
      </p>
    </PolicyPage>
  );
}
