import { getAdminUser } from "@/lib/supabase/auth";
import { listOrders } from "@/lib/orders-store";
import { Suspense } from "react";
import ToastFromQuery from "@/components/admin/ToastFromQuery";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();

  // This wraps every single admin page just to show a sidebar badge count
  // — a Supabase hiccup here should never be able to take down the whole
  // admin panel. Same resilience pattern already used for the storefront's
  // category nav.
  let pendingOrderCount = 0;
  try {
    pendingOrderCount = (await listOrders()).filter((o) => o.status === "pending_confirmation").length;
  } catch (err) {
    console.error("AdminLayout: failed to load orders for the sidebar badge, showing 0", err);
  }

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-paper text-void">
      <AdminSidebar userEmail={user?.email} pendingOrderCount={pendingOrderCount} />

      {/* Main */}
      <div className="flex-1 min-w-0">
        <Suspense fallback={null}>
          <ToastFromQuery />
        </Suspense>
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
