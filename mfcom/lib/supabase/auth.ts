import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// -----------------------------------------------------------------------------
// Auth uses the PUBLISHABLE key, not the secret key — this is correct and
// intentional. Supabase Auth identifies the user via their session JWT
// (stored in cookies), and Row Level Security policies check auth.uid()
// against that JWT. The secret key (lib/supabase/server.ts) is for a
// different purpose: bypassing RLS entirely for trusted server-side data
// operations like the product CRUD actions.
// -----------------------------------------------------------------------------

export function createAuthServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component render, not a Server Action —
            // middleware.ts is what actually refreshes the session cookie
            // in that case, so this failing silently here is expected.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // see note above
          }
        },
      },
    }
  );
}

/** The signed-in admin user, or null. Use this instead of trusting a custom cookie. */
export async function getAdminUser() {
  const supabase = createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
