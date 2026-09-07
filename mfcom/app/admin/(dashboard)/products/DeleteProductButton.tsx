"use client";

import { Trash2 } from "lucide-react";
import { deleteProductAction } from "./actions";

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteProductAction}
      onSubmit={(e) => {
        if (!confirm(`Delete "${name}"? This can't be undone.`)) {
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
