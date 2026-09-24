import "server-only";

// -----------------------------------------------------------------------------
// AI-assisted product detail filling — for the "I have 100+ products with
// just a name and a price, writing real copy for each is too much" problem.
//
// Uses Google's Gemini API: genuinely free tier (Google AI Studio, no card
// required), unlike most "free tier" LLM APIs that actually need billing
// enabled. Get a key at https://aistudio.google.com/apikey → set
// GEMINI_API_KEY in your environment variables.
//
// Deliberately conservative about specifications: the model only has a
// product's name/brand/category to go on, not the actual product in front
// of it, so it's instructed to leave out anything it would have to guess
// (exact DPI, battery life, weight) rather than invent a plausible-sounding
// number that might be wrong — stating a wrong technical spec to a real
// customer is worse than not stating it. Whatever it does produce lands in
// the same editable form fields as manual entry, never auto-saved as final.
// -----------------------------------------------------------------------------

export type EnrichedProductDetails = {
  shortSpec: string;
  description: string;
  specifications: { label: string; value: string }[];
};

export type EnrichInput = {
  name: string;
  brand?: string;
  category?: string;
  condition?: "new" | "used";
};

const PROMPT_INSTRUCTIONS = `You are writing product listing copy for a computer accessories shop in Karachi, Pakistan. You will be given a product's name, brand, and category — nothing else. No photos, no manufacturer spec sheet, no hands-on knowledge of this specific unit.

Write:
- "shortSpec": one short line (under 70 characters) — the kind of one-liner shown under a product name in a store listing. Plain, factual, no marketing fluff.
- "description": 2-3 sentences a real shopper would find useful, in plain English.
- "specifications": an array of {label, value} pairs, ONLY for facts you can reasonably determine from the name/brand/category itself (e.g. connectivity type if the name says "Bluetooth" or "Wired", capacity if the name says "2TB", form factor if it's obvious). Do NOT invent precise numbers you cannot know from the name alone — no fabricated DPI, battery life, weight, or dimensions. If you genuinely can't determine any real specs beyond Brand/Category, return an empty array — an empty list is correct and expected far more often than not.

Respond with ONLY a JSON object: {"shortSpec": "...", "description": "...", "specifications": [{"label": "...", "value": "..."}]}`;

export async function enrichProductDetails(input: EnrichInput): Promise<EnrichedProductDetails> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "AI auto-fill isn't set up yet. Get a free API key at aistudio.google.com/apikey and add it as GEMINI_API_KEY in your environment variables."
    );
  }

  const userContent = [
    `Product name: ${input.name}`,
    input.brand ? `Brand: ${input.brand}` : null,
    input.category ? `Category: ${input.category}` : null,
    input.condition ? `Condition: ${input.condition === "used" ? "used/pre-owned" : "brand new"}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const requestBody = JSON.stringify({
    contents: [{ parts: [{ text: `${PROMPT_INSTRUCTIONS}\n\n${userContent}` }] }],
    // Gemini 3.x models ignore custom temperature/top_p/top_k and are
    // tuned for their defaults, so it's left out rather than set to a
    // value that no longer does anything.
    generationConfig: { responseMimeType: "application/json" },
  });
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

  // "Model is currently experiencing high demand" (503) is Google's
  // servers being temporarily overloaded, not a real failure — genuinely
  // common on the free tier since it shares capacity. A couple of quick
  // retries with backoff clears this most of the time without the admin
  // needing to manually click the button again.
  let res: Response | null = null;
  let lastBody: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: requestBody });
    if (res.ok) break;
    lastBody = await res.json().catch(() => null);
    const isOverloaded = res.status === 503 || res.status === 429;
    if (!isOverloaded || attempt === 2) break;
    await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
  }

  if (!res || !res.ok) {
    const status = res?.status;
    if (status === 503 || status === 429) {
      throw new Error("Gemini is busy right now (free-tier capacity) — this usually clears in a minute or two. Try again shortly.");
    }
    const message = (lastBody as { error?: { message?: string } })?.error?.message;
    throw new Error(message || `AI auto-fill failed (${status ?? "no response"})`);
  }

  const data = await res.json();
  // Not just parts[0] — Gemini 3.x "thinking" models can prepend a
  // reasoning part before the actual answer part, so this takes the first
  // part that actually has text rather than assuming it's always first.
  const parts: { text?: string }[] = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.find((p) => p.text)?.text;
  if (!text) throw new Error("AI auto-fill returned nothing usable — try again.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("AI auto-fill returned something unparseable — try again.");
  }

  const p = parsed as Partial<EnrichedProductDetails>;
  return {
    shortSpec: typeof p.shortSpec === "string" ? p.shortSpec.slice(0, 100) : "",
    description: typeof p.description === "string" ? p.description : "",
    specifications: Array.isArray(p.specifications)
      ? p.specifications
          .filter((s): s is { label: string; value: string } => !!s && typeof s.label === "string" && typeof s.value === "string")
          .slice(0, 8)
      : [],
  };
}
