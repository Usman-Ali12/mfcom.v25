import "server-only";
import { createServerSupabaseClient } from "./supabase/server";

// -----------------------------------------------------------------------------
// SiteSettings — Supabase-backed, single row (id = 'default'). Same
// async-preserved-names pattern as the products/categories migrations.
// Schema: supabase/migrations/0003_settings.sql.
// -----------------------------------------------------------------------------

export type SiteSettings = {
  whatsappNumber: string;
  whatsappDisplay: string;
  whatsappSecondaryNumber: string;
  whatsappSecondaryDisplay: string;
  whatsappSecondaryName: string;
  whatsappPrimaryName: string;
  whatsappDefaultMessage: string;
  address: string;
  email: string;
  tagline: string;
  freeDeliveryThreshold: number;
};

// Fallback if the settings row is ever missing or the DB is briefly
// unreachable — the storefront layout needs something to render rather
// than crash. Kept in sync with the migration's seed values.
const FALLBACK: SiteSettings = {
  whatsappNumber: "923072991650",
  whatsappDisplay: "0307-2991650",
  whatsappPrimaryName: "M. Faizan",
  whatsappSecondaryNumber: "923213606991",
  whatsappSecondaryDisplay: "0321-3606991",
  whatsappSecondaryName: "M. Zeeshan",
  whatsappDefaultMessage: "Hi, I have a question about a product on MF COM.",
  address: "Shop # G-49, Gate No. 2, Ground Floor, Naz Plaza, M.A. Jinnah Road, Karachi",
  email: "mfcom0157@gmail.com",
  tagline: "Deals in all kinds of computer accessories — branded & China accessories, gaming accessories, and general order supply.",
  freeDeliveryThreshold: 15000,
};

type SettingsRow = {
  whatsapp_number: string;
  whatsapp_display: string;
  whatsapp_primary_name: string;
  whatsapp_secondary_number: string;
  whatsapp_secondary_display: string;
  whatsapp_secondary_name: string;
  whatsapp_default_message: string;
  address: string;
  email: string;
  tagline: string;
  free_delivery_threshold: number;
};

function rowToSettings(row: SettingsRow): SiteSettings {
  return {
    whatsappNumber: row.whatsapp_number,
    whatsappDisplay: row.whatsapp_display,
    whatsappPrimaryName: row.whatsapp_primary_name,
    whatsappSecondaryNumber: row.whatsapp_secondary_number,
    whatsappSecondaryDisplay: row.whatsapp_secondary_display,
    whatsappSecondaryName: row.whatsapp_secondary_name,
    whatsappDefaultMessage: row.whatsapp_default_message,
    address: row.address,
    email: row.email,
    tagline: row.tagline,
    freeDeliveryThreshold: row.free_delivery_threshold,
  };
}

export async function getSettings(): Promise<SiteSettings> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", "default").maybeSingle();
  if (error || !data) {
    if (error) console.error("getSettings: falling back to defaults —", error.message);
    return FALLBACK;
  }
  return rowToSettings(data as SettingsRow);
}

export async function updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const supabase = createServerSupabaseClient();
  const row: Record<string, unknown> = {};
  if (patch.whatsappNumber !== undefined) row.whatsapp_number = patch.whatsappNumber;
  if (patch.whatsappDisplay !== undefined) row.whatsapp_display = patch.whatsappDisplay;
  if (patch.whatsappPrimaryName !== undefined) row.whatsapp_primary_name = patch.whatsappPrimaryName;
  if (patch.whatsappSecondaryNumber !== undefined) row.whatsapp_secondary_number = patch.whatsappSecondaryNumber;
  if (patch.whatsappSecondaryDisplay !== undefined) row.whatsapp_secondary_display = patch.whatsappSecondaryDisplay;
  if (patch.whatsappSecondaryName !== undefined) row.whatsapp_secondary_name = patch.whatsappSecondaryName;
  if (patch.whatsappDefaultMessage !== undefined) row.whatsapp_default_message = patch.whatsappDefaultMessage;
  if (patch.address !== undefined) row.address = patch.address;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.tagline !== undefined) row.tagline = patch.tagline;
  if (patch.freeDeliveryThreshold !== undefined) row.free_delivery_threshold = patch.freeDeliveryThreshold;
  row.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from("site_settings").update(row).eq("id", "default").select("*").single();
  if (error) throw new Error(`updateSettings: ${error.message}`);
  return rowToSettings(data as SettingsRow);
}
