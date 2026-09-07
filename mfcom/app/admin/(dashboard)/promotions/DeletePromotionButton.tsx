"use client";

import { Trash2 } from "lucide-react";
import { deletePromotionAction } from "./actions";

export default function DeletePromotionButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deletePromotionAction}
      onSubmit={(e) => {
        if (!confirm(`Delete "${name}"? This can't be undone.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="p-2 text-steel hover:text-red transition-colors" aria-label="Delete">
        <Trash2 size={15} />
      </button>
    </form>
  );
}
