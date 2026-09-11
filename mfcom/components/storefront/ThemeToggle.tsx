"use client";

import { useEffect, useRef, useState } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "mfcom-theme";
type Theme = "light" | "dark" | "system";

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme: Theme) {
  const isDark = theme === "dark" || (theme === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", isDark);
}

export default function ThemeToggle() {
  // Default is "light" — first-time visitors always see the light theme,
  // never an auto-detected dark mode, per the brief. "system" is available
  // as an explicit opt-in, not the default.
  const [theme, setTheme] = useState<Theme>("light");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Theme | null) || "light";
    setTheme(saved);

    if (saved === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => applyTheme("system");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable (private browsing etc.) — theme just won't persist
    }
    applyTheme(next);
  }

  const Icon = theme === "dark" ? Moon : theme === "system" ? Monitor : Sun;
  const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change theme"
        aria-expanded={open}
        className="p-2.5 hover:text-red transition-colors"
      >
        <Icon size={19} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-full mt-2 w-36 bg-void border border-white/10 chamfer-sm shadow-2xl py-1 z-50"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => choose(opt.value)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-paper/85 hover:bg-white/5 hover:text-white transition-colors"
              >
                <opt.icon size={15} />
                <span className="flex-1 text-left">{opt.label}</span>
                {theme === opt.value && <Check size={13} className="text-red" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
