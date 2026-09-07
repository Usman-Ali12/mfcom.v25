"use server";

import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/admin");

  const supabase = createAuthServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}

export async function logoutAction() {
  const supabase = createAuthServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
