"use client";

import Link from "next/link";
import type { Promotion } from "@/lib/promotions-store";

function toLocalInput(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function PromotionForm({
  action,
  initial,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  initial?: Promotion;
  submitLabel: string;
}) {
  return (
    <form action={action} className="max-w-2xl space-y-6">
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <section className="bg-white border border-line chamfer p-6 space-y-4">
        <div>
          <label className="text-xs font-medium block mb-1.5">Internal name *</label>
          <input
            name="name"
            required
            defaultValue={initial?.name}
            placeholder="e.g. Flash Sale — Gaming Week"
            className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
          />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1.5">Banner title (shown to customers) *</label>
          <input
            name="title"
            required
            defaultValue={initial?.title}
            className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
          />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1.5">Message</label>
          <textarea
            name="message"
            rows={2}
            defaultValue={initial?.message}
            placeholder="e.g. Up to 15% off gaming peripherals, while stock lasts."
            className="w-full px-3 py-2 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium block mb-1.5">Starts *</label>
            <input
              name="startDate"
              type="datetime-local"
              required
              defaultValue={initial ? toLocalInput(initial.startDate) : ""}
              className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5">Ends *</label>
            <input
              name="endDate"
              type="datetime-local"
              required
              defaultValue={initial ? toLocalInput(initial.endDate) : ""}
              className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red font-mono"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1.5">Product slugs (comma-separated)</label>
          <input
            name="productSlugs"
            defaultValue={initial?.productSlugs?.join(", ")}
            placeholder="razer-deathadder-v3, logitech-g-pro-x-keyboard"
            className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red font-mono"
          />
          <p className="text-xs text-steel mt-1.5">
            Find a product's slug in its URL — the part after <code>/product/</code>.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} className="accent-red w-4 h-4" />
          Active (still needs to be within the start/end window to actually show)
        </label>
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          className="h-11 px-6 bg-red text-white text-sm font-medium chamfer hover:bg-red-dim transition-colors"
        >
          {submitLabel}
        </button>
        <Link
          href="/admin/promotions"
          className="h-11 px-6 flex items-center border border-line chamfer text-sm font-medium hover:bg-paper transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
