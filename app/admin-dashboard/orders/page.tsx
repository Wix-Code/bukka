import { redirect } from "next/navigation";

import EmptyState from "@/components/reusuable/EmptyState";
import Pagination from "@/components/reusuable/PaginationProps";

import { createSupabaseAdminClient } from "@/lib/admin";

import { Dropbox } from "iconsax-react";

import { CheckCircle2, Clock3, ShoppingBag, XCircle } from "lucide-react";
import AdminOrdersToolbar from "@/components/admin-dashboard/order/AdminOrdersToolbar";

const PAGE_SIZE = 10;

type OrderStatus = "all" | "pending" | "completed" | "cancelled";

type SearchParams = {
  page?: string;
  search?: string;
  status?: string;
};

type VendorRelation = {
  name: string | null;
} | null;

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function cleanSearch(value: string) {
  return value.replace(/[(),]/g, " ").replace(/\s+/g, " ").trim();
}

function buildOrdersHref({
  page,
  search,
  status,
}: {
  page: number;
  search: string;
  status: OrderStatus;
}) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (search) {
    params.set("search", search);
  }

  if (status !== "all") {
    params.set("status", status);
  }

  const query = params.toString();

  return query ? `/admin/orders?${query}` : "/admin/orders";
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const currentPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const search = cleanSearch(params.search ?? "");

  const status: OrderStatus =
    params.status === "pending" ||
    params.status === "completed" ||
    params.status === "cancelled"
      ? params.status
      : "all";

  const from = (currentPage - 1) * PAGE_SIZE;

  const to = from + PAGE_SIZE - 1;

  const supabase = createSupabaseAdminClient();

  /*
   * ----------------------------------
   * STATISTICS
   * ----------------------------------
   *
   * These always show platform-wide
   * totals, independent of filters.
   */
  const [totalResult, pendingResult, completedResult, cancelledResult] =
    await Promise.all([
      supabase.from("orders").select("id", {
        count: "exact",
        head: true,
      }),

      supabase
        .from("orders")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("status", "pending"),

      supabase
        .from("orders")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("status", "completed"),

      supabase
        .from("orders")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("status", "cancelled"),
    ]);

  /*
   * ----------------------------------
   * MAIN ORDERS QUERY
   * ----------------------------------
   */
  let query = supabase
    .from("orders")
    .select(
      `
        id,
        item_name,
        item_price,
        customer_name,
        status,
        created_at,
        vendor_id,
        vendors (
          name
        )
      `,
      {
        count: "exact",
      },
    )
    .order("created_at", {
      ascending: false,
    });

  /*
   * Search
   *
   * Searches food/item name and
   * customer name.
   */
  if (search) {
    query = query.or(
      [`item_name.ilike.%${search}%`, `customer_name.ilike.%${search}%`].join(
        ",",
      ),
    );
  }

  /*
   * Status filter
   */
  if (status !== "all") {
    query = query.eq("status", status);
  }

  /*
   * Pagination
   */
  const { data: orders, count, error } = await query.range(from, to);

  if (error) {
    console.error("Admin orders query failed:", error.message);
  }

  const totalRecords = count ?? 0;

  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

  /*
   * If the user was on page 5
   * and filtering reduces results
   * to only 2 pages, redirect them
   * to the last valid page.
   */
  if (!error && totalRecords > 0 && currentPage > totalPages) {
    redirect(
      buildOrdersHref({
        page: totalPages,
        search,
        status,
      }),
    );
  }

  function createPageHref(page: number) {
    return buildOrdersHref({
      page,
      search,
      status,
    });
  }

  return (
    <div>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

        <p className="mt-1 text-sm text-gray-500">
          Monitor customer orders across all vendors on the platform.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total orders"
          value={totalResult.count ?? 0}
          icon={<ShoppingBag size={21} />}
          iconClassName="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Pending"
          value={pendingResult.count ?? 0}
          icon={<Clock3 size={21} />}
          iconClassName="bg-yellow-50 text-yellow-600"
        />

        <StatCard
          title="Completed"
          value={completedResult.count ?? 0}
          icon={<CheckCircle2 size={21} />}
          iconClassName="bg-green-50 text-green-600"
        />

        <StatCard
          title="Cancelled"
          value={cancelledResult.count ?? 0}
          icon={<XCircle size={21} />}
          iconClassName="bg-red-50 text-red-600"
        />
      </div>

      {/* SEARCH + FILTER */}
      <AdminOrdersToolbar initialSearch={search} initialStatus={status} />

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t load orders: {error.message}
          <br />
          <span className="text-red-600/70">
            Check your Supabase service role key and verify that the selected
            order columns exist.
          </span>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {!orders || orders.length === 0 ? (
          <div className="p-12">
            {error ? (
              <p className="text-center text-sm text-gray-500">
                Couldn&apos;t load orders. See the error above.
              </p>
            ) : (
              <EmptyState
                icon={<Dropbox size={28} color="#16A34A" />}
                title={
                  search || status !== "all"
                    ? "No matching orders"
                    : "No orders available"
                }
                description={
                  search || status !== "all"
                    ? "Try another search term or change the status filter."
                    : "Orders will appear here once customers begin ordering from vendors."
                }
              />
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-gray-500">
                  <th className="px-6 py-4 font-medium">Order</th>

                  <th className="px-6 py-4 font-medium">Vendor</th>

                  <th className="px-6 py-4 font-medium">Item</th>

                  <th className="px-6 py-4 font-medium">Customer</th>

                  <th className="px-6 py-4 font-medium">Amount</th>

                  <th className="px-6 py-4 font-medium">Placed</th>

                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const vendor = order.vendors as unknown as VendorRelation;

                  return (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-gray-50/70"
                    >
                      {/* ORDER */}
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-gray-400">
                        #{order.id.slice(0, 8)}
                      </td>

                      {/* VENDOR */}
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {vendor?.name ?? "—"}
                      </td>

                      {/* ITEM */}
                      <td className="px-6 py-4 text-gray-700">
                        {order.item_name}
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-6 py-4 text-gray-600">
                        {order.customer_name || "Guest"}
                      </td>

                      {/* AMOUNT */}
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                        ₦{Number(order.item_price).toLocaleString("en-NG")}
                      </td>

                      {/* PLACED */}
                      <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                        {formatTime(order.created_at)}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                            statusStyles[order.status] ??
                            "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RESULT COUNT */}
      {!error && orders && orders.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-400">
            Showing {from + 1}–{Math.min(from + orders.length, totalRecords)} of{" "}
            {totalRecords} orders
          </p>
        </div>
      )}

      {/* PAGINATION */}
      {!error && totalRecords > PAGE_SIZE && (
        <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            createPageHref={createPageHref}
          />
        </div>
      )}
    </div>
  );
}

/* --------------------------------
   STAT CARD
-------------------------------- */

function StatCard({
  title,
  value,
  icon,
  iconClassName,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconClassName: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value.toLocaleString("en-NG")}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
