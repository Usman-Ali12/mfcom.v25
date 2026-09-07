import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { getSettings } from "@/lib/settings-store";
import { SITE_URL } from "@/lib/site";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with MF COM — visit us in Karachi, call, or message on WhatsApp.",
  alternates: { canonical: `${SITE_URL}/contact` },
};
export const dynamic = "force-dynamic"; // reads live settings

export default async function ContactPage() {
  const settings = await getSettings();
  const contacts = [
    { name: settings.whatsappPrimaryName, number: settings.whatsappNumber, display: settings.whatsappDisplay },
    { name: settings.whatsappSecondaryName, number: settings.whatsappSecondaryNumber, display: settings.whatsappSecondaryDisplay },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-14">
      <p className="mono-label text-xs text-red mb-2">Get in touch</p>
      <h1 className="font-display text-display-md font-semibold mb-3 dark:text-paper">Contact MF COM</h1>
      <p className="text-steel max-w-lg mb-12">{settings.tagline}</p>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Details */}
        <div className="space-y-6">
          <div className="flex gap-4 bg-white dark:bg-graphite dark:border-white/10 border border-line chamfer p-5">
            <MapPin size={20} className="text-red shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1 dark:text-paper">Visit the shop</p>
              <p className="text-sm text-steel">{settings.address}</p>
            </div>
          </div>

          <div className="flex gap-4 bg-white dark:bg-graphite dark:border-white/10 border border-line chamfer p-5">
            <Phone size={20} className="text-red shrink-0" />
            <div className="w-full">
              <p className="text-sm font-medium mb-2 dark:text-paper">Call or WhatsApp</p>
              <div className="space-y-2">
                {contacts.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <span className="text-steel">{c.name}</span>
                    <span className="font-mono">{c.display}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 bg-white dark:bg-graphite dark:border-white/10 border border-line chamfer p-5">
            <Mail size={20} className="text-red shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1 dark:text-paper">Email</p>
              <a href={`mailto:${settings.email}`} className="text-sm text-steel hover:text-red transition-colors">
                {settings.email}
              </a>
            </div>
          </div>

          <div className="flex gap-4 bg-white dark:bg-graphite dark:border-white/10 border border-line chamfer p-5">
            <Clock size={20} className="text-red shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1 dark:text-paper">Shop hours</p>
              <p className="text-sm text-steel">Saturday – Thursday, 11:00 AM – 9:30 PM</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {contacts.map((c) => (
              <a
                key={c.name}
                href={`https://wa.me/${c.number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-12 flex items-center justify-center gap-2 bg-[#25D366] text-white text-sm font-medium chamfer hover:brightness-95 transition"
              >
                <MessageCircle size={16} /> WhatsApp {c.name}
              </a>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="bg-white dark:bg-graphite dark:border-white/10 border border-line chamfer overflow-hidden h-[420px] lg:h-auto">
          <iframe
            title="MF COM location — Naz Plaza, M.A. Jinnah Road, Karachi"
            className="w-full h-full min-h-[420px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Naz+Plaza+M.A.+Jinnah+Road+Karachi&output=embed"
          />
        </div>
      </div>
    </div>
  );
}
