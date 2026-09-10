// -----------------------------------------------------------------------------
// Product type + real business details for MF COM. Product catalog data
// itself now lives in Supabase (see lib/admin-store.ts + supabase/migrations/
// 0001_products.sql) — the sample catalog and category/brand lists that used
// to live in this file were removed as dead code once that migration
// shipped (nothing in the app imported them anymore; categories and brands
// are managed live via lib/categories-store.ts and lib/brands-store.ts).
// -----------------------------------------------------------------------------

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  shortSpec: string;
  description: string;
  price: number;
  previousPrice?: number;
  currency: "PKR";
  stock: "in-stock" | "low-stock" | "out-of-stock";
  stockCount: number;
  rating: number;
  reviewCount: number;
  image: string;
  gallery: string[];
  specifications: { label: string; value: string }[];
  warranty: string;
  badge?: "New" | "Best Seller" | "Deal";
  /** Item condition — brand-new stock vs. used/pre-owned (laptops especially). Shown as a customer-facing badge and filterable on /shop. */
  condition: "new" | "used";
};

// Real MF COM business details, from the client's storefront/business card.
// Backs SiteSettings once the CMS settings page is wired to Prisma.
export const storeInfo = {
  name: "MF COM",
  tagline:
    "Deals in all kinds of computer accessories — branded & China accessories, gaming accessories, and general order supply.",
  address: "Shop # G-49, Gate No. 2, Ground Floor, Naz Plaza, M.A. Jinnah Road, Karachi",
  email: "mfcom0157@gmail.com",
  facebook: "facebook.com/m.faizan123",
  contacts: [
    { name: "M. Faizan", numbers: ["0307-2991650", "0324-3406750"], display: "0307-2991650" },
    { name: "M. Zeeshan", numbers: ["0321-3606991", "0334-2037121"], display: "0321-3606991" },
  ],
  brandPartners: ["Dell", "HP", "Lenovo", "HyperX", "Logitech", "SteelSeries"],
};
