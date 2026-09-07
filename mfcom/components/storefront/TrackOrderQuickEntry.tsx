"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";

export default function TrackOrderQuickEntry() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/track/${trimmed}`);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="hidden sm:flex items-center gap-1.5 text-xs text-paper/70 hover:text-white transition-colors"
      >
        <Package size={13} /> Track Order
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <form
            onSubmit={handleSubmit}
            className="absolute right-0 top-full mt-2 w-64 bg-void border border-white/10 chamfer-sm shadow-2xl p-3 z-50"
          >
            <label className="mono-label text-[10px] text-paper/50 block mb-1.5">Order number</label>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="MFC-10001"
              className="w-full h-9 px-3 bg-white/[0.06] chamfer-sm text-sm text-paper outline-none focus:ring-1 focus:ring-red font-mono mb-2"
            />
            <button
              type="submit"
              className="w-full h-9 bg-red text-white text-sm font-medium chamfer-sm hover:bg-red-dim transition-colors"
            >
              Track
            </button>
          </form>
        </>
      )}
    </div>
  );
}
