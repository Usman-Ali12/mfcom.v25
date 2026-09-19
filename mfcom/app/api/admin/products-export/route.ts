import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/auth";
import { listProducts } from "@/lib/admin-store";

function csvField(value: string | number): string {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const COLUMNS = [
  "name", "sku", "brand", "category", "condition", "price", "currency",
  "stock", "stockCount", "description", "image", "warranty",
] as const;

// Reverse of the catalog importer — a plain backup/handoff export, not
// meant to round-trip back through the WhatsApp-scrape importer (different
// column shape on purpose: this one is the real product record, not a
// scraped draft).
export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const products = await listProducts();
  const lines = [
    COLUMNS.join(","),
    ...products.map((p) => COLUMNS.map((col) => csvField(p[col as keyof typeof p] as string | number)).join(",")),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mfcom-catalog-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
