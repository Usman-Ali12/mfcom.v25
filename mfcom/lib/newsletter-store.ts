import "server-only";
import { createServerSupabaseClient } from "./supabase/server";

// -----------------------------------------------------------------------------
// Newsletter subscribers — Supabase-backed. Same pattern as every other
// store in this project. Schema: supabase/migrations/0006_newsletter.sql.
// No public read policy — holds contact info, same privacy stance as
// `orders`. Only ever written to via the server-side secret key.
// -----------------------------------------------------------------------------

export async function addNewsletterSubscriber(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("newsletter_subscribers").upsert({ email: trimmed }, { onConflict: "email" });
  if (error) return { ok: false, error: "Something went wrong — try again." };
  return { ok: true };
}
