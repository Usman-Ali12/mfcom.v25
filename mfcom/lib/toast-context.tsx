"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";
type Toast = { id: string; message: string; type: ToastType };

type ToastContextValue = {
  toast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const COLORS: Record<ToastType, string> = {
  success: "bg-void text-white",
  error: "bg-red text-white",
  info: "bg-void text-white",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/*
        Anchored bottom-right, not centered on the full viewport. A
        viewport-centered toast used to visually collide with the admin
        sidebar (same dark bg-void as the toast itself) at common
        laptop/tablet widths, making a real "status updated" confirmation
        look like it never appeared. Bottom-right avoids the sidebar
        entirely — it's only ever on the left — on every breakpoint.
        max-w + break-words keeps long messages from overflowing a narrow
        phone screen instead of being clipped at the viewport edge.
      */}
      <div className="fixed bottom-5 right-4 left-4 sm:left-auto z-[9999] flex flex-col items-end gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={`pointer-events-auto flex items-center gap-2 pl-3 pr-2 py-2.5 chamfer-sm shadow-2xl border border-white/10 text-sm font-medium w-full sm:w-auto max-w-full sm:max-w-sm ${COLORS[t.type]}`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="break-words">{t.message}</span>
                <button onClick={() => dismiss(t.id)} className="ml-auto sm:ml-1 shrink-0 opacity-70 hover:opacity-100 transition-opacity" aria-label="Dismiss">
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
