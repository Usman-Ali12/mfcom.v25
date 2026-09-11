"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { SiteSettings } from "@/lib/settings-store";

export default function WhatsAppFloat({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);

  const contacts = [
    { name: settings.whatsappPrimaryName, number: settings.whatsappNumber, display: settings.whatsappDisplay },
    {
      name: settings.whatsappSecondaryName,
      number: settings.whatsappSecondaryNumber,
      display: settings.whatsappSecondaryDisplay,
    },
  ];

  return (
    <div className="fixed bottom-20 right-5 md:bottom-5 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "bottom right" }}
            className="bg-white dark:bg-graphite dark:border-white/10 chamfer border border-line shadow-2xl w-64 p-4"
          >
            <p className="text-sm font-medium mb-1 dark:text-paper">Need help choosing?</p>
            <p className="text-xs text-steel mb-3">
              Message our team on WhatsApp — usually replies in a few minutes.
            </p>
            <div className="space-y-2">
              {contacts.map((c) => (
                <a
                  key={c.number}
                  href={`https://wa.me/${c.number}?text=${encodeURIComponent(settings.whatsappDefaultMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press flex items-center justify-between w-full h-10 px-3 bg-[#25D366] text-white text-sm font-medium chamfer-sm hover:brightness-95 transition"
                >
                  <span>{c.name}</span>
                  <span className="font-mono text-xs opacity-90">{c.display}</span>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        aria-label={open ? "Close WhatsApp chat" : "Chat on WhatsApp"}
        onClick={() => setOpen((v) => !v)}
        className="press w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
