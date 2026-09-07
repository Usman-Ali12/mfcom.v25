import { NextRequest, NextResponse } from "next/server";
import { listProducts } from "@/lib/admin-store";

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const products = await listProducts();
  const results = products
    .filter((p) => `${p.name} ${p.brand} ${p.category} ${p.sku}`.toLowerCase().includes(q))
    .slice(0, 6)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      price: p.price,
      image: p.image,
    }));

  return NextResponse.json({ results });
}
