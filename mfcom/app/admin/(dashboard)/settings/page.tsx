import { getSettings } from "@/lib/settings-store";
import { updateSettingsAction } from "./actions";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({ searchParams }: { searchParams: { saved?: string } }) {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Settings</h1>
      <p className="text-sm text-steel mb-6">
        Controls the WhatsApp numbers, contact info, and tagline used across the
        storefront — footer, contact page, product enquiries, and the floating
        WhatsApp button all read from here.
      </p>

      {searchParams.saved && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 chamfer-sm">
          Settings saved.
        </div>
      )}

      <form action={updateSettingsAction} className="max-w-2xl space-y-8">
        <section className="bg-white border border-line chamfer p-6">
          <p className="mono-label text-[11px] text-red mb-4">Primary WhatsApp contact</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="text-xs font-medium block mb-1.5">Staff name</label>
              <input
                name="whatsappPrimaryName"
                defaultValue={settings.whatsappPrimaryName}
                className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">
                WhatsApp number (with country code, no +)
              </label>
              <input
                name="whatsappNumber"
                defaultValue={settings.whatsappNumber}
                placeholder="923072991650"
                className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">Display format</label>
              <input
                name="whatsappDisplay"
                defaultValue={settings.whatsappDisplay}
                placeholder="0307-2991650"
                className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red font-mono"
              />
            </div>
          </div>
        </section>

        <section className="bg-white border border-line chamfer p-6">
          <p className="mono-label text-[11px] text-red mb-4">Secondary WhatsApp contact</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium block mb-1.5">Staff name</label>
              <input
                name="whatsappSecondaryName"
                defaultValue={settings.whatsappSecondaryName}
                className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">WhatsApp number</label>
              <input
                name="whatsappSecondaryNumber"
                defaultValue={settings.whatsappSecondaryNumber}
                className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">Display format</label>
              <input
                name="whatsappSecondaryDisplay"
                defaultValue={settings.whatsappSecondaryDisplay}
                className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red font-mono"
              />
            </div>
          </div>
        </section>

        <section className="bg-white border border-line chamfer p-6">
          <p className="mono-label text-[11px] text-red mb-4">Messaging &amp; delivery</p>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium block mb-1.5">Default WhatsApp message (floating button)</label>
              <textarea
                name="whatsappDefaultMessage"
                rows={2}
                defaultValue={settings.whatsappDefaultMessage}
                className="w-full px-3 py-2 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">Free delivery threshold (PKR)</label>
              <input
                name="freeDeliveryThreshold"
                type="number"
                min={0}
                defaultValue={settings.freeDeliveryThreshold}
                className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red font-mono"
              />
            </div>
          </div>
        </section>

        <section className="bg-white border border-line chamfer p-6">
          <p className="mono-label text-[11px] text-red mb-4">Business info</p>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium block mb-1.5">Address</label>
              <input
                name="address"
                defaultValue={settings.address}
                className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={settings.email}
                className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">Tagline</label>
              <textarea
                name="tagline"
                rows={2}
                defaultValue={settings.tagline}
                className="w-full px-3 py-2 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
              />
            </div>
          </div>
        </section>

        <button
          type="submit"
          className="h-11 px-6 bg-red text-white text-sm font-medium chamfer hover:bg-red-dim transition-colors"
        >
          Save settings
        </button>
      </form>
    </div>
  );
}
