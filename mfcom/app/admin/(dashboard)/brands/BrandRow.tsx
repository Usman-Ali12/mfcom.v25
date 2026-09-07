"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { Brand } from "@/lib/brands-store";
import { updateBrandAction } from "./actions";
import DeleteBrandButton from "./DeleteBrandButton";

export default function BrandRow({ brand }: { brand: Brand }) {
  const [dirty, setDirty] = useState(false);

  return (
    <tr className="border-b border-line last:border-0">
      <td className="p-3">
        <form
          action={updateBrandAction}
          className="flex items-center gap-2"
          onSubmit={() => setDirty(false)}
        >
          <input type="hidden" name="id" value={brand.id} />
          <input
            name="name"
            defaultValue={brand.name}
            onChange={() => setDirty(true)}
            className="h-9 px-2.5 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red w-full max-w-[220px]"
          />
          {dirty && (
            <button
              type="submit"
              className="w-9 h-9 flex items-center justify-center bg-red text-white chamfer-sm hover:bg-red-dim transition-colors shrink-0"
              aria-label="Save"
            >
              <Check size={14} />
            </button>
          )}
        </form>
      </td>
      <td className="p-3 text-steel text-xs font-mono">/{brand.slug}</td>
      <td className="p-3 w-16">
        <DeleteBrandButton id={brand.id} name={brand.name} />
      </td>
    </tr>
  );
}
