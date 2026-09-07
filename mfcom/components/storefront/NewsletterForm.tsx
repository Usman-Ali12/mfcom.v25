"use client";

import { useState } from "react";
import { subscribeToNewsletterAction } from "@/lib/newsletter-actions";
import { useToast } from "@/lib/toast-context";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    const result = await subscribeToNewsletterAction(email);
    setSubmitting(false);
    if (result.ok) {
      toast("Subscribed — thanks for joining!", "success");
      setEmail("");
    } else {
      toast(result.error, "error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-xs">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="flex-1 h-10 px-3 bg-white/[0.06] text-sm chamfer-sm placeholder:text-paper/40 outline-none"
      />
      <button
        type="submit"
        disabled={submitting}
        className="h-10 px-4 bg-red text-sm font-medium chamfer-sm hover:bg-red-dim transition-colors disabled:opacity-60 shrink-0"
      >
        {submitting ? "…" : "Join"}
      </button>
    </form>
  );
}
