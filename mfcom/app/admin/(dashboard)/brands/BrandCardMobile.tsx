"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { Brand } from "@/lib/brands-store";
import { updateBrandAction } from "./actions";
import DeleteBrandButton from "./DeleteBrandButton";

// Same inline-edit behavior as BrandRow, laid out as a stacked card instead
// of a table row — a table forces horizontal scrolling just to reach the
// delete icon on a phone-width screen, which is exactly the kind of thing
// that reads as "not mobile friendly."
export default function BrandCardMobile({ brand }: { brand: Brand }) {
  const [dirty, setDirty] = useState(false);

  return (
    <div className="bg-white border border-line chamfer p-4">
      <form action={updateBrandAction} className="space-y-2" onSubmit={() => setDirty(false)}>
        <input type="hidden" name="id" value={brand.id} />
        <label className="text-xs font-medium block">Name</label>
        <input
          name="name"
          defaultValue={brand.name}
          onChange={() => setDirty(true)}
          className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
        />
        <p className="text-xs text-steel font-mono">/{brand.slug}</p>
        <div className="flex items-center gap-2 pt-1">
          {dirty && (
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-red text-white text-xs font-medium chamfer-sm hover:bg-red-dim transition-colors"
            >
              <Check size={14} /> Save
            </button>
          )}
          <div className={dirty ? "" : "ml-auto"}>
            <DeleteBrandButton id={brand.id} name={brand.name} />
          </div>
        </div>
      </form>
    </div>
  );
}
