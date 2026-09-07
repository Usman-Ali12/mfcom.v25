"use client";

import { Trash2 } from "lucide-react";
import { deleteCategoryAction } from "./actions";

export default function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteCategoryAction}
      onSubmit={(e) => {
        if (!confirm(`Delete "${name}"? Products already in this category will keep the old category name until reassigned.`)) {
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
