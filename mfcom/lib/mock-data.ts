// -----------------------------------------------------------------------------
// Temporary data layer. Shape mirrors the planned Prisma models 1:1 so that
// swapping this file for `lib/db/products.ts` (real Prisma queries) later is
// a drop-in change — components below never assume "mock", they just import
// from "@/lib/mock-data" today and "@/lib/db/products" once Postgres is wired.
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
};

export const categoryMenu = [
  {
    group: "Computers",
    items: ["Laptops", "Gaming Laptops", "Business Laptops", "Desktop PCs"],
  },
  {
    group: "Components",
    items: ["Graphics Cards", "Processors", "RAM", "SSD", "HDD"],
  },
  {
    group: "Peripherals",
    items: ["Keyboards", "Mice", "Headphones", "Microphones", "Speakers"],
  },
  {
    group: "Accessories",
    items: ["Cables", "Chargers", "USB Hubs", "Laptop Stands", "Docking Stations"],
  },
  {
    group: "Gaming",
    items: ["Gaming Keyboards", "Gaming Mice", "Gaming Headsets", "Cooling Pads"],
  },
];

export const brands = [
  "Logitech",
  "Razer",
  "HyperX",
  "Corsair",
  "Keychron",
  "ASUS",
  "Lenovo",
  "Dell",
  "MSI",
  "Samsung",
  "Boya",
];

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

const rawProducts: Omit<Product, "sku">[] = [
  {
    id: "p1",
    slug: "logitech-g-pro-x-keyboard",
    name: "G Pro X Mechanical Keyboard",
    brand: "Logitech",
    category: "Gaming Keyboards",
    shortSpec: "Hot-swappable · GX Blue clicky · Tenkeyless",
    description:
      "Tournament-grade tenkeyless keyboard built for esports. Swap switches without a soldering iron, and drop the detachable cable at any angle for your setup.",
    price: 34900,
    previousPrice: 41900,
    currency: "PKR",
    stock: "in-stock",
    stockCount: 34,
    rating: 4.7,
    reviewCount: 212,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1200&q=80",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&q=80",
      "https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=1200&q=80",
    ],
    specifications: [
      { label: "Switch type", value: "GX Blue Clicky (hot-swappable)" },
      { label: "Layout", value: "Tenkeyless (TKL)" },
      { label: "Connectivity", value: "USB-C, detachable" },
      { label: "Keycaps", value: "Double-shot PBT" },
      { label: "Polling rate", value: "1000Hz" },
    ],
    warranty: "2-year manufacturer warranty",
    badge: "Deal",
  },
  {
    id: "p2",
    slug: "razer-deathadder-v3",
    name: "DeathAdder V3 Wireless Mouse",
    brand: "Razer",
    category: "Gaming Mice",
    shortSpec: "59g · 30K DPI sensor · 90hr battery",
    description:
      "The DeathAdder shape refined for competitive play — sub-60g with a flagship optical sensor and battery life that outlasts a weekend LAN.",
    price: 19900,
    currency: "PKR",
    stock: "in-stock",
    stockCount: 51,
    rating: 4.8,
    reviewCount: 501,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=1200&q=80",
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=1200&q=80",
      "https://images.unsplash.com/photo-1615663245622-6df7d7db51e9?w=1200&q=80",
    ],
    specifications: [
      { label: "Sensor", value: "Focus Pro 30K optical" },
      { label: "Weight", value: "59g" },
      { label: "Battery life", value: "Up to 90 hours" },
      { label: "Connectivity", value: "2.4GHz wireless + Bluetooth" },
      { label: "Switches", value: "Razer Optical Gen-3" },
    ],
    warranty: "2-year manufacturer warranty",
    badge: "Best Seller",
  },
  {
    id: "p3",
    slug: "asus-rog-strix-rtx-4070",
    name: "ROG Strix RTX 4070 12GB",
    brand: "ASUS",
    category: "Graphics Cards",
    shortSpec: "12GB GDDR6X · Triple fan · OC edition",
    description:
      "Triple-fan cooling and a factory overclock built into the ROG Strix shroud — enough headroom for 1440p ultra without the card ever getting loud.",
    price: 289900,
    previousPrice: 314900,
    currency: "PKR",
    stock: "low-stock",
    stockCount: 4,
    rating: 4.9,
    reviewCount: 88,
    image: "https://images.unsplash.com/photo-1591405351990-4726e331f141?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1591405351990-4726e331f141?w=1200&q=80",
      "https://images.unsplash.com/photo-1591489378430-ef2f4c626b46?w=1200&q=80",
      "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=1200&q=80",
    ],
    specifications: [
      { label: "Memory", value: "12GB GDDR6X" },
      { label: "Cooling", value: "Triple axial-tech fans" },
      { label: "Boost clock", value: "2610 MHz (OC mode)" },
      { label: "Power connector", value: "1x 16-pin" },
      { label: "Outputs", value: "3x DisplayPort 1.4a, 2x HDMI 2.1" },
    ],
    warranty: "3-year manufacturer warranty",
    badge: "Deal",
  },
  {
    id: "p4",
    slug: "hyperx-cloud-iii-wireless",
    name: "Cloud III Wireless Headset",
    brand: "HyperX",
    category: "Gaming Headsets",
    shortSpec: "120hr battery · DTS Headphone:X · 53mm driver",
    description:
      "Five days of battery on a single charge and a memory foam fit that stays comfortable through a full raid night.",
    price: 24900,
    currency: "PKR",
    stock: "in-stock",
    stockCount: 22,
    rating: 4.6,
    reviewCount: 164,
    image: "https://images.unsplash.com/photo-1599669454699-248893623440?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1599669454699-248893623440?w=1200&q=80",
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1200&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&q=80",
    ],
    specifications: [
      { label: "Driver", value: "53mm angled" },
      { label: "Battery life", value: "Up to 120 hours" },
      { label: "Surround sound", value: "DTS Headphone:X" },
      { label: "Connectivity", value: "2.4GHz USB wireless" },
      { label: "Microphone", value: "Detachable noise-cancelling" },
    ],
    warranty: "2-year manufacturer warranty",
  },
  {
    id: "p5",
    slug: "keychron-k8-pro",
    name: "K8 Pro Wireless Mechanical Keyboard",
    brand: "Keychron",
    category: "Keyboards",
    shortSpec: "QMK/VIA · Hot-swap · Mac & Win layout",
    description:
      "A daily-driver mechanical keyboard that's equally at home on macOS and Windows, fully remappable through QMK/VIA with no software install required.",
    price: 22900,
    currency: "PKR",
    stock: "in-stock",
    stockCount: 40,
    rating: 4.5,
    reviewCount: 97,
    image: "https://images.unsplash.com/photo-1595225476474-460b7a8c822c?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1595225476474-460b7a8c822c?w=1200&q=80",
      "https://images.unsplash.com/photo-1618384887925-045d3e6c8d5f?w=1200&q=80",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&q=80",
    ],
    specifications: [
      { label: "Layout", value: "TKL, 87-key" },
      { label: "Firmware", value: "QMK/VIA" },
      { label: "Connectivity", value: "Bluetooth 5.1, 2.4GHz, USB-C wired" },
      { label: "Switches", value: "Gateron hot-swappable" },
      { label: "Battery", value: "4000mAh" },
    ],
    warranty: "1-year manufacturer warranty",
    badge: "New",
  },
  {
    id: "p6",
    slug: "lenovo-legion-5-pro",
    name: "Legion 5 Pro — Ryzen 7 / RTX 4060",
    brand: "Lenovo",
    category: "Gaming Laptops",
    shortSpec: "16\" QHD 165Hz · 16GB RAM · 512GB SSD",
    description:
      "A 16-inch QHD 165Hz panel paired with Ryzen 7 and an RTX 4060 — enough to run current titles at high settings without hitting thermal throttle in a 90-minute session.",
    price: 419900,
    previousPrice: 459900,
    currency: "PKR",
    stock: "in-stock",
    stockCount: 9,
    rating: 4.7,
    reviewCount: 63,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&q=80",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80",
    ],
    specifications: [
      { label: "Processor", value: "AMD Ryzen 7 7745HX" },
      { label: "Graphics", value: "RTX 4060 8GB" },
      { label: "Display", value: "16\" QHD+ 165Hz" },
      { label: "RAM", value: "16GB DDR5" },
      { label: "Storage", value: "512GB NVMe SSD" },
    ],
    warranty: "1-year manufacturer warranty",
    badge: "Deal",
  },
  {
    id: "p7",
    slug: "corsair-vengeance-32gb",
    name: "Vengeance RGB 32GB DDR5-6000",
    brand: "Corsair",
    category: "RAM",
    shortSpec: "2x16GB · CL36 · RGB",
    description:
      "DDR5-6000 with tight CL36 timings and a ten-zone RGB bar per stick — the straightforward upgrade for anyone still running 16GB.",
    price: 27900,
    currency: "PKR",
    stock: "in-stock",
    stockCount: 60,
    rating: 4.6,
    reviewCount: 143,
    image: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1562976540-1502c2145186?w=1200&q=80",
      "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1200&q=80",
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1200&q=80",
    ],
    specifications: [
      { label: "Capacity", value: "32GB (2x16GB)" },
      { label: "Speed", value: "DDR5-6000" },
      { label: "Timings", value: "CL36-36-36-76" },
      { label: "Voltage", value: "1.35V" },
    ],
    warranty: "Lifetime manufacturer warranty",
  },
  {
    id: "p8",
    slug: "samsung-990-pro-2tb",
    name: "990 Pro 2TB NVMe SSD",
    brand: "Samsung",
    category: "SSD",
    shortSpec: "PCIe 4.0 · 7450MB/s read",
    description:
      "Samsung's flagship PCIe 4.0 drive — 7450MB/s sequential read with a nickel-coated controller for sustained performance under load.",
    price: 32900,
    currency: "PKR",
    stock: "in-stock",
    stockCount: 47,
    rating: 4.9,
    reviewCount: 310,
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1200&q=80",
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=1200&q=80",
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&q=80",
    ],
    specifications: [
      { label: "Capacity", value: "2TB" },
      { label: "Interface", value: "PCIe 4.0 x4, NVMe 2.0" },
      { label: "Sequential read", value: "7,450 MB/s" },
      { label: "Sequential write", value: "6,900 MB/s" },
      { label: "Form factor", value: "M.2 2280" },
    ],
    warranty: "5-year manufacturer warranty",
    badge: "Best Seller",
  },
];

// Real SKUs derived from brand + id — kept out of the literals above so
// each product doesn't need a hand-written SKU; admin-created products
// get one the same way via lib/admin-store.ts's slugify.
export const products: Product[] = rawProducts.map((p) => ({
  ...p,
  sku: `${p.brand.slice(0, 3).toUpperCase()}-${p.id.toUpperCase()}`,
}));

export const flashSale = {
  title: "Flash Sale — Gaming Week",
  message: "Up to 15% off gaming peripherals, while stock lasts.",
  // real dates — the countdown component computes remaining time from these,
  // never from a hardcoded duration
  startsAt: "2026-08-20T00:00:00+05:00",
  endsAt: "2026-08-31T23:59:59+05:00",
  productSlugs: ["logitech-g-pro-x-keyboard", "razer-deathadder-v3", "asus-rog-strix-rtx-4070", "lenovo-legion-5-pro"],
};
