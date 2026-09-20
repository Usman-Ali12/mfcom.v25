import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/auth";
import { enrichProductDetails } from "@/lib/ai-enrich";

export async function POST(request: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = String(body?.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Product name is required first" }, { status: 400 });
  }

  try {
    const result = await enrichProductDetails({
      name,
      brand: body?.brand,
      category: body?.category,
      condition: body?.condition,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "AI auto-fill failed" }, { status: 500 });
  }
}
