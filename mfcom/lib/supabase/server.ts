import "server-only";
import { createClient } from "@supabase/supabase-js";

// -----------------------------------------------------------------------------
// Server client — uses the SECRET key (Supabase's new key format; equivalent
// role to the old "service_role" key). This bypasses Row Level Security
// entirely, so it must only ever run in server components, Server Actions,
// or API routes — never in a "use client" file or anything that ships to
// the browser.
//
// The `server-only` import above is a build-time guard: if this file is
// ever accidentally imported from client code, the build fails instead of
// silently bundling the secret key into client JS.
// -----------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

export function createServerSupabaseClient() {
  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "Supabase env vars missing — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local"
    );
  }
  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false },
  });
}
