import { createSupabaseAdminClient } from "@/lib/admin";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-900/40 text-yellow-400",
  completed: "bg-green-900/40 text-green-400",
  cancelled: "bg-red-900/40 text-red-400",
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
  const { data: orders } = await supabase
    .from("orders")
    .select("id, item_name, item_price, status, created_at, vendors(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Orders</h1>
      <p className="text-sm text-gray-400 mb-8">
        The last 100 orders across every vendor. Read-only — status changes
        belong to the vendor, not the platform.
      </p>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {!orders || orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No orders yet across the platform.
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
              <tbody className="divide-y divide-gray-800">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 text-white font-medium">
                      {(order.vendors as unknown as { name: string } | null)
                        ?.name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {order.item_name}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
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
