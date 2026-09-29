"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import EmptyState from "@/components/reusuable/EmptyState";
import { Dropbox } from "iconsax-react";

export type Order = {
  id: string;
  item_name: string;
  item_price: number;
  customer_name: string | null;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
};

const statusStyles: Record<Order["status"], string> = {
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

export default function OrdersManager({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(id: string, status: Order["status"]) {
    const previous = orders;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    setError(null);

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      setOrders(previous);
      setError(error.message);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Orders</h1>
      <p className="text-sm text-gray-500 mb-8">
        All orders placed through your menu.
      </p>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {orders.length > 0 ? (
          <div className="bg-white rounded-3xl">
            <EmptyState
              icon={<Dropbox size={28} color="#16A34A" />}
              title="No orders available"
              description="No orders yet, they&rsquo;ll show up here once a customer orders
          from your menu."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Order</th>
                  <th className="px-6 py-3 font-medium">Item</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Placed</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {order.item_name}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      ₦{order.item_price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatTime(order.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(
                            order.id,
                            e.target.value as Order["status"],
                          )
                        }
                        className={`text-xs font-medium rounded-full pl-3 pr-2 py-1.5 border-none outline-none cursor-pointer ${
                          statusStyles[order.status]
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
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
