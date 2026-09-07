import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { storeInfo } from "@/lib/mock-data";
import { getSettings } from "@/lib/settings-store";
import { SITE_URL } from "@/lib/site";

export const metadata = {
  title: "About Us",
  description: "MF COM is Karachi's computer and gaming accessories shop at Naz Plaza, M.A. Jinnah Road — branded and China accessories, authorized dealer for Dell, HP, Lenovo, HyperX, Logitech, and SteelSeries.",
  alternates: { canonical: `${SITE_URL}/about` },
};
export const dynamic = "force-dynamic"; // reads live settings

export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8 py-16">
      <p className="mono-label text-xs text-red mb-3">About us</p>
      <h1 className="font-display text-display-md font-semibold mb-6 dark:text-paper">
        Karachi's stop for computer &amp; gaming gear.
      </h1>
      <p className="text-base text-void/70 dark:text-paper/70 leading-relaxed mb-6 max-w-2xl">
        MF COM is based at Naz Plaza on M.A. Jinnah Road, Karachi — {settings.tagline.toLowerCase()}
        Whether you need a single cable or a full workstation build, our team sources it.
      </p>
      <p className="text-base text-void/70 dark:text-paper/70 leading-relaxed mb-10 max-w-2xl">
        We work directly with authorized distributors for {storeInfo.brandPartners.slice(0, -1).join(", ")}{" "}
        and {storeInfo.brandPartners.slice(-1)}, alongside a wider range of branded and
        China-market accessories for shoppers who want more choice at every price point.
      </p>

      <div className="grid sm:grid-cols-3 gap-6 mb-12">
        <div className="border-t border-red pt-4">
          <p className="font-mono text-2xl font-semibold dark:text-paper">2,400+</p>
          <p className="text-xs text-steel mt-1">SKUs in stock</p>
        </div>
        <div className="border-t border-red pt-4">
          <p className="font-mono text-2xl font-semibold dark:text-paper">6</p>
          <p className="text-xs text-steel mt-1">Authorized brand partners</p>
        </div>
        <div className="border-t border-red pt-4">
          <p className="font-mono text-2xl font-semibold dark:text-paper">2</p>
          <p className="text-xs text-steel mt-1">People ready on WhatsApp</p>
        </div>
      </div>

      <Link
        href="/contact"
        className="inline-flex items-center gap-2 h-12 px-6 bg-void dark:bg-red text-white text-sm font-medium chamfer hover:bg-red dark:hover:bg-red-dim transition-colors"
      >
        Get in touch <ArrowUpRight size={16} />
      </Link>
    </div>
  );
}
