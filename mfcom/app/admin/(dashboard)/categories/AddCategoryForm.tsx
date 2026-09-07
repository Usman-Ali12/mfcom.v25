"use client";

import { useState } from "react";
import Select from "@/components/storefront/Select";
import { createCategoryAction } from "./actions";

const NEW_GROUP_VALUE = "__new__";

export default function AddCategoryForm({ groups }: { groups: string[] }) {
  const [group, setGroup] = useState(groups[0] || NEW_GROUP_VALUE);
  const [newGroupName, setNewGroupName] = useState("");
  const isNewGroup = group === NEW_GROUP_VALUE;

  return (
    <form action={createCategoryAction} className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[160px]">
        <label className="text-xs font-medium block mb-1.5">Name</label>
        <input
          name="name"
          required
          placeholder="e.g. Webcams"
          className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
        />
      </div>
      <div className="w-44">
        <label className="text-xs font-medium block mb-1.5">Group</label>
        <Select
          value={group}
          onChange={setGroup}
          options={[
            ...groups.map((g) => ({ value: g, label: g })),
            { value: NEW_GROUP_VALUE, label: "+ New group…" },
          ]}
        />
      </div>
      {isNewGroup && (
        <div className="w-44">
          <label className="text-xs font-medium block mb-1.5">New group name</label>
          <input
            name="group"
            required
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="e.g. Networking"
            className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
          />
        </div>
      )}
      {!isNewGroup && <input type="hidden" name="group" value={group} />}
      <button
        type="submit"
        className="h-10 px-4 bg-red text-white text-sm font-medium chamfer-sm hover:bg-red-dim transition-colors"
      >
        Add
      </button>
    </form>
  );
}
