"use client";

import { useState } from "react";
import { AlertTriangle, Copy, Check } from "lucide-react";

const SQL = `alter table products
  add column if not exists condition text not null default 'new'
    check (condition in ('new', 'used'));

update products set condition = 'new' where condition is null;

comment on column products.condition is 'new = brand-new/sealed stock, used = pre-owned/open-box';`;

export default function MigrationWarningBanner() {
  const [copied, setCopied] = useState(false);

  return (
    <div className="bg-red/5 border-b border-red/20 px-4 sm:px-8 py-3">
      <div className="flex items-start gap-3 max-w-3xl">
        <AlertTriangle size={18} className="text-red shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red">
            Database update pending — New/Used won't save until this runs
          </p>
          <p className="text-xs text-steel mt-0.5">
            Every product save is quietly dropping the Condition field because your database is
            missing a column. Run this once in Supabase → SQL Editor, then refresh this page.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(SQL);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="press flex items-center gap-1.5 h-8 px-3 bg-void text-white text-xs font-medium chamfer-sm"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy SQL"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
