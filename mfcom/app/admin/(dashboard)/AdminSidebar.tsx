"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Package,
  FolderTree,
  Award,
  Image as ImageIcon,
  Tag,
  Users,
  Settings,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";

export type AdminNavItem = { href: string; label: string; icon: LucideIcon };

// Static nav config lives here (in the client component) rather than in the
// server layout — icon components are function references and can't be
// passed as serialized props from a server component to a client component.
const navItems: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/brands", label: "Brands", icon: Award },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/promotions", label: "Promotions", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: Users },
  { href: "/admin/automations", label: "Automations", icon: Zap },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar({
  userEmail,
  pendingOrderCount,
}: {
  userEmail?: string;
  pendingOrderCount: number;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navList = (
    <>
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between px-5 h-11 sm:h-10 text-sm transition-colors ${
                active ? "text-white bg-white/10" : "text-paper/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-3">
                <item.icon size={16} />
                {item.label}
              </span>
              {item.href === "/admin/orders" && pendingOrderCount > 0 && (
                <span className="bg-red text-white text-[10px] leading-none w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                  {pendingOrderCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-paper/40 mb-2 truncate">{userEmail}</p>
        <form action={logoutAction}>
          <button className="flex items-center gap-2 text-xs text-paper/60 hover:text-red transition-colors">
            <LogOut size={13} /> Sign out
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar — hamburger trigger, sidebar is a slide-out drawer below sm */}
      <div className="sm:hidden sticky top-0 z-40 h-14 flex items-center justify-between px-4 bg-void text-paper border-b border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-on-dark.png" alt="MF COM" className="h-6 w-auto" />
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-2 -mr-2">
          <Menu size={22} />
        </button>
      </div>

      {open && (
        <div className="sm:hidden fixed inset-0 z-50 flex">
          <div className="w-72 max-w-[80vw] bg-void text-paper flex flex-col">
            <div className="h-14 flex items-center justify-between px-4 border-b border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-on-dark.png" alt="MF COM" className="h-6 w-auto" />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2 -mr-2">
                <X size={20} />
              </button>
            </div>
            {navList}
          </div>
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="flex-1 bg-black/40"
          />
        </div>
      )}

      {/* Desktop sidebar — fixed, always visible at sm+ */}
      <aside className="hidden sm:flex w-60 shrink-0 bg-void text-paper flex-col">
        <div className="h-16 flex items-center px-5 border-b border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-on-dark.png" alt="MF COM" className="h-7 w-auto" />
        </div>
        {navList}
      </aside>
    </>
  );
}
