import "server-only";
import { createServerSupabaseClient } from "./supabase/server";

// -----------------------------------------------------------------------------
// Orders — Supabase-backed, the last store migrated off file storage.
// Schema: supabase/migrations/0005_orders.sql. Same async-preserved-names
// pattern as every other store in this project.
//
// Order numbers now come from a real Postgres sequence (order_number_seq)
// instead of a hand-rolled JSON counter file — the file-based version had
// exactly the kind of cross-worker race condition bug this project
// already found and fixed for a different store; a sequence avoids that
// class of bug outright, atomically, at the database level.
//
// RLS note: unlike every other table, `orders` has NO public read policy
// (see the migration) — it holds real customer names/phone numbers/
// addresses. Every function here uses the secret-key client, which
// bypasses RLS by design; the publishable (browser) key can't read this
// table at all.
// -----------------------------------------------------------------------------

export type OrderStatus = "pending_confirmation" | "confirmed" | "dispatched" | "delivered" | "cancelled";
export type DeliveryProvider = "Bykea" | "Yango" | "InDrive" | "Other";

export type OrderItem = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  qty: number;
};

export type Order = {
  orderNumber: string; // e.g. "MFC-10234"
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  status: OrderStatus;
  deliveryProvider?: DeliveryProvider;
  trackingUrl?: string;
  createdAt: string;
  updatedAt: string;
};

type OrderRow = {
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  notes: string | null;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  status: OrderStatus;
  delivery_provider: DeliveryProvider | null;
  tracking_url: string | null;
  created_at: string;
  updated_at: string;
};

function rowToOrder(row: OrderRow): Order {
  return {
    orderNumber: row.order_number,
    customerName: row.customer_name,
    phone: row.phone,
    address: row.address,
    notes: row.notes ?? undefined,
    items: row.items ?? [],
    subtotal: row.subtotal,
    delivery: row.delivery,
    total: row.total,
    status: row.status,
    deliveryProvider: row.delivery_provider ?? undefined,
    trackingUrl: row.tracking_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createOrder(
  input: Omit<Order, "orderNumber" | "status" | "createdAt" | "updatedAt">
): Promise<Order> {
  const supabase = createServerSupabaseClient();
  const row = {
    customer_name: input.customerName,
    phone: input.phone,
    address: input.address,
    notes: input.notes ?? null,
    items: input.items,
    subtotal: input.subtotal,
    delivery: input.delivery,
    total: input.total,
  };
  // order_number, status, created_at, updated_at all come from the
  // table's own defaults — not set here, so the sequence/trigger own them.
  const { data, error } = await supabase.from("orders").insert(row).select().single();
  if (error) throw new Error(`createOrder: ${error.message}`);
  return rowToOrder(data as OrderRow);
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("orders").select("*").eq("order_number", orderNumber).maybeSingle();
  if (error) throw new Error(`getOrderByNumber: ${error.message}`);
  return data ? rowToOrder(data as OrderRow) : undefined;
}

export async function listOrders(): Promise<Order[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("listOrders: falling back to empty list —", error.message);
    return [];
  }
  return (data as OrderRow[]).map(rowToOrder);
}

export async function updateOrderStatus(
  orderNumber: string,
  update: { status: OrderStatus; deliveryProvider?: DeliveryProvider; trackingUrl?: string }
): Promise<Order | undefined> {
  const supabase = createServerSupabaseClient();
  const row: Record<string, unknown> = { status: update.status };
  if (update.deliveryProvider !== undefined) row.delivery_provider = update.deliveryProvider;
  if (update.trackingUrl !== undefined) row.tracking_url = update.trackingUrl;

  const { data, error } = await supabase
    .from("orders")
    .update(row)
    .eq("order_number", orderNumber)
    .select()
    .maybeSingle();
  if (error) throw new Error(`updateOrderStatus: ${error.message}`);
  return data ? rowToOrder(data as OrderRow) : undefined;
}
