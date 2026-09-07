import { createClient } from "@supabase/supabase-js";

// -----------------------------------------------------------------------------
// Browser client — uses the PUBLISHABLE key only (Supabase's new key format;
// equivalent role to the old "anon" key). Safe to import into "use client"
// components: this key is meant to be public and relies on Row Level
// Security policies in Supabase to restrict what it can actually do.
//
// Never import lib/supabase/server.ts (the secret-key client) from a
// client component — that key must never reach the browser.
// -----------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function createBrowserSupabaseClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Supabase env vars missing — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local"
    );
  }
  return createClient(supabaseUrl, supabasePublishableKey);
}
