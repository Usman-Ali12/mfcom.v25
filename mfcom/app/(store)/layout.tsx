import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import WhatsAppFloat from "@/components/storefront/WhatsAppFloat";
import MobileBottomNav from "@/components/storefront/MobileBottomNav";
import RouteTransitionOverlay from "@/components/storefront/RouteTransitionOverlay";
import { getSettings } from "@/lib/settings-store";
import { listCategoryGroups } from "@/lib/categories-store";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  // Every single storefront page renders through this layout, so a
  // transient Supabase issue here would otherwise take down the entire
  // site rather than just the pages that specifically need category data.
  // Degrade gracefully instead: log it, show an empty nav, keep the site up.
  let categoryGroups: { group: string; items: string[] }[] = [];
  try {
    categoryGroups = await listCategoryGroups();
  } catch (err) {
    console.error("StoreLayout: failed to load categories, rendering with an empty category nav", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-void transition-colors duration-200">
      <RouteTransitionOverlay />
      <Header whatsappDisplay={settings.whatsappDisplay} categoryGroups={categoryGroups} />
      {/* pb-14 on mobile reserves space for the fixed bottom nav so content never sits under it */}
      <main className="flex-1 pb-14 md:pb-0">{children}</main>
      <Footer settings={settings} categoryGroups={categoryGroups} />
      <WhatsAppFloat settings={settings} />
      <MobileBottomNav />
    </div>
  );
}
