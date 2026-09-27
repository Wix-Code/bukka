import { redirect } from "next/navigation";
import { Wallet2, Bag2, Book1, Clock } from "iconsax-react";
import MenuQRCard from "@/components/dashboard/MenuQrCode";
import { createSupabaseServerClient } from "@/lib/server";

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

export default async function DashboardOverview() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    { data: vendor },
    { data: monthOrders },
    { count: menuItemCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("vendors").select("name, slug").eq("id", user.id).single(),
    supabase
      .from("orders")
      .select("item_price, status")
      .eq("vendor_id", user.id)
      .gte("created_at", startOfMonth.toISOString()),
    supabase
      .from("menu_items")
      .select("id", { count: "exact", head: true })
      .eq("vendor_id", user.id),
    supabase
      .from("orders")
      .select("id, item_name, item_price, status, created_at")
      .eq("vendor_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const ordersThisMonth = monthOrders ?? [];
  const revenueThisMonth = ordersThisMonth
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + Number(o.item_price), 0);
  const pendingOrders = ordersThisMonth.filter(
    (o) => o.status === "pending"
  ).length;

  const stats = [
    {
      label: "Revenue this month",
      value: `₦${revenueThisMonth.toLocaleString()}`,
      icon: Wallet2,
    },
    {
      label: "Orders this month",
      value: ordersThisMonth.length.toString(),
      icon: Bag2,
    },
    {
      label: "Menu items",
      value: (menuItemCount ?? 0).toString(),
      icon: Book1,
    },
    {
      label: "Pending orders",
      value: pendingOrders.toString(),
      icon: Clock,
    },
  ];

  return (
    <div>
      <p className="text-gray-500 mb-8">
        Here&rsquo;s how {vendor?.name ?? "your restaurant"} is doing today.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <Icon size={20} color="currentColor" variant="Bold" />
              </div>
              <p className="mt-4 text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {vendor?.slug && <MenuQRCard slug={vendor.slug} />}

      <div className="bg-white rounded-2xl shadow-sm mt-8 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent orders</h2>
        </div>

        {!recentOrders || recentOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No orders yet — they&rsquo;ll show up here once a customer orders
            from your menu.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Item</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Placed</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 text-gray-900 font-medium">
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
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          statusStyles[order.status]
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
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