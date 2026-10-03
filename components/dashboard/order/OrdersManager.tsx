"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { supabase } from "@/lib/supabase";
import EmptyState from "@/components/reusuable/EmptyState";

import { Dropbox } from "iconsax-react";

import { Check, ChevronDown, Search, SlidersHorizontal } from "lucide-react";

export type Order = {
  id: string;
  item_name: string;
  item_price: number;
  customer_name: string | null;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
};

type StatusFilter = "all" | "pending" | "completed" | "cancelled";

const statusStyles: Record<Order["status"], string> = {
  pending: "bg-yellow-50 text-yellow-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const statusOptions: {
  label: string;
  value: StatusFilter;
}[] = [
  {
    label: "All statuses",
    value: "all",
  },
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Completed",
    value: "completed",
  },
  {
    label: "Cancelled",
    value: "cancelled",
  },
];

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
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [statusOpen, setStatusOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedStatus =
    statusOptions.find((option) => option.value === statusFilter) ??
    statusOptions[0];

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setStatusOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setStatusOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);

      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      const matchesSearch =
        normalizedQuery === "" ||
        order.item_name.toLowerCase().includes(normalizedQuery) ||
        order.customer_name?.toLowerCase().includes(normalizedQuery) ||
        order.id.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesSearch;
    });
  }, [orders, query, statusFilter]);

  async function updateStatus(id: string, status: Order["status"]) {
    const previous = orders;

    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              status,
            }
          : order,
      ),
    );

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
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Orders</h1>

        <p className="text-sm text-gray-500">
          All orders placed through your menu.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Search + Filter */}
      {orders.length > 0 && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders"
              className="w-full rounded-full border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          {/* Custom dropdown */}
          <div ref={dropdownRef} className="relative w-full sm:w-[220px]">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={statusOpen}
              onClick={() => setStatusOpen((prev) => !prev)}
              className={`flex w-full items-center justify-between rounded-full border bg-white py-3 pl-4 pr-4 text-sm text-gray-700 transition-all duration-200 ${
                statusOpen
                  ? "border-green-600 ring-2 ring-green-100"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <SlidersHorizontal size={17} className="text-gray-400" />

                <span className="flex items-center gap-2.5">
                  <StatusDot status={statusFilter} />

                  {selectedStatus.label}
                </span>
              </div>

              <ChevronDown
                size={17}
                className={`text-gray-400 transition-transform duration-200 ${
                  statusOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown menu */}
            {statusOpen && (
              <div
                role="listbox"
                className="absolute right-0 z-40 mt-2 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl"
              >
                {statusOptions.map((option) => {
                  const active = statusFilter === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        setStatusFilter(option.value);

                        setStatusOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                        active
                          ? "bg-green-50 text-green-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <StatusDot status={option.value} />

                        {option.label}
                      </span>

                      {active && <Check size={16} className="text-green-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {orders.length === 0 ? (
          <div className="rounded-3xl bg-white">
            <EmptyState
              icon={<Dropbox size={28} color="#16A34A" />}
              title="No orders available"
              description="No orders yet, they'll show up here once a customer orders from your menu."
            />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16">
            <EmptyState
              icon={<Search size={28} className="text-green-600" />}
              title="No matching orders"
              description="Try another search term or choose a different status."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-gray-500">
                  <th className="px-6 py-4 font-medium">Order</th>

                  <th className="px-6 py-4 font-medium">Item</th>

                  <th className="px-6 py-4 font-medium">Customer</th>

                  <th className="px-6 py-4 font-medium">Amount</th>

                  <th className="px-6 py-4 font-medium">Placed</th>

                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="transition hover:bg-gray-50/70">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">
                      #{order.id.slice(0, 8)}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-900">
                      {order.item_name}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {order.customer_name || "Guest"}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-900">
                      ₦{Number(order.item_price).toLocaleString()}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">
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
                        className={`cursor-pointer rounded-full border-none py-1.5 pl-3 pr-2 text-xs font-medium outline-none ${
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

      {/* Results count */}
      {orders.length > 0 && (
        <p className="mt-4 text-xs text-gray-400">
          Showing {filteredOrders.length} of {orders.length} orders on this page
        </p>
      )}
    </div>
  );
}

/* -----------------------------
   STATUS DOT
------------------------------ */

function StatusDot({ status }: { status: StatusFilter }) {
  if (status === "pending") {
    return <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-yellow-400" />;
  }

  if (status === "completed") {
    return <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />;
  }

  if (status === "cancelled") {
    return <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />;
  }

  return <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gray-300" />;
}
