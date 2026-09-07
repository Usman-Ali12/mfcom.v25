import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { storeInfo } from "@/lib/mock-data";
import type { SiteSettings } from "@/lib/settings-store";
import NewsletterForm from "@/components/storefront/NewsletterForm";

export default function Footer({
  settings,
  categoryGroups,
}: {
  settings: SiteSettings;
  categoryGroups: { group: string; items: string[] }[];
}) {
  return (
    <footer className="bg-void text-paper mt-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-on-dark.png" alt="MF COM" className="h-9 w-auto mb-4" />
            <p className="text-sm text-paper/60 max-w-xs mb-5">{settings.tagline}</p>

            <div className="space-y-2.5 text-sm text-paper/70 mb-6">
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-red shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={15} className="text-red shrink-0" />
                <span>
                  {settings.whatsappDisplay} · {settings.whatsappSecondaryDisplay}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-red shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                  {settings.email}
                </a>
              </div>
            </div>

            <NewsletterForm />
          </div>

          {categoryGroups.slice(0, 3).map((group) => (
            <div key={group.group}>
              <p className="mono-label text-[11px] text-red mb-4">{group.group}</p>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li key={item}>
                    <Link
                      href={`/category/${item.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-sm text-paper/70 hover:text-white transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Brand partners */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="mono-label text-[10px] text-paper/40 mb-4">Authorized dealer for</p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {storeInfo.brandPartners.map((b) => (
              <span key={b} className="mono-label text-sm text-paper/60">
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col gap-4 text-xs text-paper/50">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/return-refund-policy" className="hover:text-white transition-colors">Return &amp; Refund Policy</Link>
            <Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link>
            <Link href="/terms-conditions" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <p>© {new Date().getFullYear()} MF COM. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/deals" className="hover:text-white transition-colors">Deals</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
