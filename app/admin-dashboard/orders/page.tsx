import EmptyState from "@/components/reusuable/EmptyState";
import { createSupabaseAdminClient } from "@/lib/admin";
import { Dropbox } from "iconsax-react";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminOrdersPage() {
  const supabase = createSupabaseAdminClient();

  // Embeds the related vendor row via the orders.vendor_id foreign key,
  // so each row can show which restaurant the order belongs to.
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, item_name, item_price, status, created_at, vendors(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) console.error("Admin orders query failed:", error.message);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Orders</h1>
      <p className="text-sm text-gray-500 mb-8">
        The last 100 orders across every vendor. Read-only — status changes
        belong to the vendor, not the platform.
      </p>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">
          Couldn&rsquo;t load orders: {error.message}
          <br />
          <span className="text-red-600/70">
            This usually means SUPABASE_SERVICE_ROLE_KEY is missing, wrong, or
            the dev server needs a restart after adding it.
          </span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {!orders || orders.length > 0 ? (
          <div className="p-12 text-center text-gray-500">
            {error
              ? "Couldn't load orders — see the error above."
              : <div className="bg-white rounded-3xl">
                  <EmptyState
                    icon={<Dropbox size={28} color="#16A34A" />}
                    title="No orders available"
                    description="No orders yet, they&rsquo;ll show up here once a customer orders
                from your menu."
                  />
                </div>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Vendor</th>
                  <th className="px-6 py-3 font-medium">Item</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Placed</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {(order.vendors as unknown as { name: string } | null)
                        ?.name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {order.item_name}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      ₦{Number(order.item_price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatTime(order.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          statusStyles[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
