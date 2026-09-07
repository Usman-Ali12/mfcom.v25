"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { Category } from "@/lib/categories-store";
import Select from "@/components/storefront/Select";
import { updateCategoryAction } from "./actions";
import DeleteCategoryButton from "./DeleteCategoryButton";

// Same inline-edit behavior as CategoryRow, laid out as a stacked card
// instead of a table row so name + group + save + delete never require
// horizontal scrolling on a phone.
export default function CategoryCardMobile({ category, groups }: { category: Category; groups: string[] }) {
  const [dirty, setDirty] = useState(false);
  const [group, setGroup] = useState(category.group);

  return (
    <div className="bg-white border border-line chamfer p-4">
      <form action={updateCategoryAction} className="space-y-2" onSubmit={() => setDirty(false)}>
        <input type="hidden" name="id" value={category.id} />
        <label className="text-xs font-medium block">Name</label>
        <input
          name="name"
          defaultValue={category.name}
          onChange={() => setDirty(true)}
          className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
        />
        <label className="text-xs font-medium block">Group</label>
        <input type="hidden" name="group" value={group} />
        <Select
          value={group}
          onChange={(v) => {
            setGroup(v);
            setDirty(true);
          }}
          options={groups.map((g) => ({ value: g, label: g }))}
        />
        <p className="text-xs text-steel font-mono">/{category.slug}</p>
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
            <DeleteCategoryButton id={category.id} name={category.name} />
          </div>
        </div>
      </form>
    </div>
  );
}
