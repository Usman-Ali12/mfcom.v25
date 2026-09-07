"use client";

import { createBrandAction } from "./actions";

export default function AddBrandForm() {
  return (
    <form action={createBrandAction} className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[160px]">
        <label className="text-xs font-medium block mb-1.5">Name</label>
        <input
          name="name"
          required
          placeholder="e.g. Cooler Master"
          className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
        />
      </div>
      <button
        type="submit"
        className="h-10 px-4 bg-red text-white text-sm font-medium chamfer-sm hover:bg-red-dim transition-colors"
      >
        Add
      </button>
    </form>
  );
}
