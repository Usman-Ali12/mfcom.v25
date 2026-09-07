"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { Category } from "@/lib/categories-store";
import Select from "@/components/storefront/Select";
import { updateCategoryAction } from "./actions";
import DeleteCategoryButton from "./DeleteCategoryButton";

export default function CategoryRow({ category, groups }: { category: Category; groups: string[] }) {
  const [dirty, setDirty] = useState(false);
  const [group, setGroup] = useState(category.group);

  return (
    <tr className="border-b border-line last:border-0">
      <td className="p-3">
        <form
          action={updateCategoryAction}
          className="flex items-center gap-2"
          onSubmit={() => setDirty(false)}
        >
          <input type="hidden" name="id" value={category.id} />
          <input
            name="name"
            defaultValue={category.name}
            onChange={() => setDirty(true)}
            className="h-9 px-2.5 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red w-full max-w-[220px]"
          />
          <input type="hidden" name="group" value={group} />
          <Select
            value={group}
            onChange={(v) => {
              setGroup(v);
              setDirty(true);
            }}
            className="w-36 shrink-0"
            options={groups.map((g) => ({ value: g, label: g }))}
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
      <td className="p-3 text-steel text-xs font-mono">/{category.slug}</td>
      <td className="p-3 w-16">
        <DeleteCategoryButton id={category.id} name={category.name} />
      </td>
    </tr>
  );
}
