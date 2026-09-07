"use client";

import { Trash2 } from "lucide-react";
import { deleteBrandAction } from "./actions";

export default function DeleteBrandButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteBrandAction}
      onSubmit={(e) => {
        if (!confirm(`Delete "${name}"? Products already using this brand will keep the old brand name until reassigned.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="p-2 text-steel hover:text-red transition-colors" aria-label="Delete">
        <Trash2 size={15} />
      </button>
    </form>
  );
}
