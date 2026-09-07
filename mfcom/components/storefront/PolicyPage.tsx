import type { ReactNode } from "react";

export default function PolicyPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[820px] px-4 sm:px-6 lg:px-8 py-16">
      <p className="mono-label text-xs text-red mb-3">{eyebrow}</p>
      <h1 className="font-display text-display-md font-semibold mb-2 dark:text-paper">{title}</h1>
      <p className="text-xs text-steel mb-10">Last updated: {updated}</p>

      <div
        className="
          space-y-6 text-sm leading-relaxed text-void/80 dark:text-paper/80
          [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-void [&_h2]:dark:text-paper [&_h2]:mt-10 [&_h2]:mb-3
          [&_p]:mb-3
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mb-3
          [&_a]:text-red [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:no-underline
          [&_strong]:text-void [&_strong]:dark:text-paper [&_strong]:font-medium
        "
      >
        {children}
      </div>
    </div>
  );
}
