import { Zap } from "lucide-react";

export const metadata = { title: "Automations" };

export default function AdminAutomationsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Automations</h1>
      <p className="text-sm text-steel mb-8 max-w-2xl">
        No automation engine wired up yet — this is a placeholder, not a
        hidden feature. The real building blocks are already here for when
        this gets built: order status changes
        (<code>lib/orders-store.ts</code>), stock levels
        (<code>lib/admin-store.ts</code>), and settings changes are all
        real events with real data behind them today. What's missing is a
        trigger → condition → action engine on top, e.g. "notify admin
        when stock drops below 5" or "auto-message customer when an order
        is marked dispatched."
      </p>

      <div className="bg-white border border-dashed border-line chamfer p-10 text-center max-w-xl">
        <Zap size={28} className="mx-auto mb-4 text-steel" />
        <p className="text-sm font-medium mb-1">Not built yet</p>
        <p className="text-xs text-steel max-w-sm mx-auto">
          Today, status-change notifications go through the "Message on
          WhatsApp" button on each order's detail page — a manual,
          one-click send, not an automatic background trigger.
        </p>
      </div>
    </div>
  );
}
