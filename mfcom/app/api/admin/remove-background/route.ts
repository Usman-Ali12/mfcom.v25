import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/auth";

// -----------------------------------------------------------------------------
// Background removal for manually-photographed products — the "take a photo
// of the Lenovo mouse on my desk and get a clean listing photo" workflow.
//
// Uses remove.bg's REST API: free to sign up, no card required, 50 free
// removals/month on the free tier (paid tiers if that's outgrown later).
// Get a key at https://www.remove.bg/api → set REMOVEBG_API_KEY in .env.
//
// Deliberately NOT wired to a local/self-hosted model (e.g. rembg) — that
// needs a Python process or GPU-backed inference server running somewhere,
// which this Next.js/Vercel-style deployment doesn't have. A hosted API is
// the only "free" option that doesn't also require standing up new
// infrastructure.
// -----------------------------------------------------------------------------

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function POST(request: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const apiKey = process.env.REMOVEBG_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Background removal isn't set up yet. Get a free API key at remove.bg/api and add it as REMOVEBG_API_KEY in your environment variables.",
      },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image too large (10MB max)" }, { status: 400 });
  }

  const upstreamForm = new FormData();
  upstreamForm.append("image_file", file);
  upstreamForm.append("size", "auto");

  let upstream: Response;
  try {
    upstream = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: upstreamForm,
    });
  } catch {
    return NextResponse.json({ error: "Couldn't reach the background-removal service" }, { status: 502 });
  }

  if (!upstream.ok) {
    const body = await upstream.json().catch(() => null);
    const message = body?.errors?.[0]?.title || `Background removal failed (${upstream.status})`;
    // remove.bg returns 402 once the monthly free quota is used up — worth
    // surfacing clearly rather than a generic failure.
    return NextResponse.json(
      { error: upstream.status === 402 ? "Free monthly background-removal quota used up." : message },
      { status: upstream.status }
    );
  }

  const bytes = await upstream.arrayBuffer();
  return new NextResponse(bytes, { headers: { "Content-Type": "image/png" } });
}
