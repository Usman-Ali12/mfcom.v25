"use client";

import { useEffect, useState } from "react";

function getRemaining(endsAt: string) {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function CountdownTimer({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState(() => getRemaining(endsAt));

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!remaining) {
    // Promotion has expired — parent section should stop rendering this
    // block entirely once the CMS marks the promotion inactive.
    return <p className="mono-label text-xs text-steel">Deal ended</p>;
  }

  const units = [
    { label: "Days", value: remaining.days },
    { label: "Hrs", value: remaining.hours },
    { label: "Min", value: remaining.minutes },
    { label: "Sec", value: remaining.seconds },
  ];

  return (
    <div className="flex items-center gap-2">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-2">
          <div className="flex flex-col items-center bg-white/10 chamfer-sm px-3 py-1.5 min-w-[52px]">
            <span className="font-mono text-lg font-semibold leading-none tabular-nums">
              {String(u.value).padStart(2, "0")}
            </span>
            <span className="mono-label text-[9px] text-paper/60 mt-1">{u.label}</span>
          </div>
          {i < units.length - 1 && <span className="text-red font-mono text-lg">:</span>}
        </div>
      ))}
    </div>
  );
}
