import { getSettings } from "@/lib/settings-store";
import { SITE_URL } from "@/lib/site";
import PolicyPage from "@/components/storefront/PolicyPage";

export const metadata = {
  title: "Privacy Policy",
  description: "How MF COM collects, uses, and protects your information.",
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
};
export const dynamic = "force-dynamic"; // reads live settings

export default async function PrivacyPolicyPage() {
  const settings = await getSettings();

  return (
    <PolicyPage eyebrow="Legal" title="Privacy Policy" updated="September 2026">
      <p>
        MF COM ("we", "us", "our") operates this website and the WhatsApp ordering
        service linked to it. This policy explains what information we collect when
        you browse, order, or contact us, and how we use it.
      </p>

      <h2>Information we collect</h2>
      <p>When you use this site, we may collect:</p>
      <ul>
        <li>Contact details you provide at checkout — name, phone number, delivery address, and email (if given).</li>
        <li>Order details — items purchased, order value, and order history.</li>
        <li>Newsletter sign-up email addresses, if you subscribe.</li>
        <li>Basic technical data (device, browser, pages viewed) used only for site performance and security.</li>
      </ul>

      <h2>How we use it</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Confirm and fulfil your order, including coordinating delivery via WhatsApp.</li>
        <li>Contact you about order status, dispatch, and delivery.</li>
        <li>Send occasional promotions or updates, only if you've subscribed to our newsletter.</li>
        <li>Improve our catalogue, service, and website.</li>
      </ul>

      <h2>WhatsApp orders</h2>
      <p>
        Checkout on this site hands off to WhatsApp for order confirmation. Any
        details you share in that WhatsApp conversation are also subject to
        WhatsApp's own privacy policy, in addition to this one.
      </p>

      <h2>Sharing your information</h2>
      <p>
        We do not sell your personal information. We only share it with the
        courier/delivery partner assigned to your order (e.g. Bykea, Yango,
        InDrive), and only what's needed to complete delivery.
      </p>

      <h2>Data storage</h2>
      <p>
        Order and account data is stored securely in our database. We keep it only
        as long as needed for order history, warranty support, and legal record-keeping.
      </p>

      <h2>Your choices</h2>
      <p>
        You can unsubscribe from the newsletter at any time using the link in any
        email we send, or by contacting us directly. You can ask us to review,
        correct, or delete your personal data by reaching out through the details below.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions about this policy? Reach us at{" "}
        <a href={`mailto:${settings.email}`}>{settings.email}</a>, on WhatsApp at{" "}
        {settings.whatsappDisplay}, or visit us at {settings.address}.
      </p>
    </PolicyPage>
  );
}
