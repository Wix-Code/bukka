import { createSupabaseAdminClient } from "@/lib/admin";
import { Shop, Bag2, Wallet2, Chart2 } from "iconsax-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminOverview() {
  // Uses the service-role client deliberately — this page reads across
  // every vendor, which ordinary RLS policies correctly refuse to allow.
  // Admin membership is already confirmed by the layout above this page.
  const supabase = createSupabaseAdminClient();

  const [
    { count: vendorCount },
    { count: activeSubCount },
    { count: orderCount },
    { data: invoices },
    { data: recentVendors },
  ] = await Promise.all([
    supabase.from("vendors").select("id", { count: "exact", head: true }),
    supabase
      .from("vendors")
      .select("id", { count: "exact", head: true })
      .eq("plan_status", "active"),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("invoices").select("amount").eq("status", "paid"),
    supabase
      .from("vendors")
      .select("id, name, slug, plan, plan_status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalRevenue = (invoices ?? []).reduce(
    (sum, inv) => sum + Number(inv.amount),
    0,
  );

  const stats = [
    {
      label: "Total vendors",
      value: (vendorCount ?? 0).toString(),
      icon: Shop,
    },
    {
      label: "Active subscriptions",
      value: (activeSubCount ?? 0).toString(),
      icon: Chart2,
    },
    {
      label: "Total orders",
      value: (orderCount ?? 0).toString(),
      icon: Bag2,
    },
    {
      label: "Total revenue",
      value: `₦${totalRevenue.toLocaleString()}`,
      icon: Wallet2,
    },
  ];

  return (
    <div>
      <p className="text-gray-400 mb-8">Platform-wide, across every vendor.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-800 text-gray-300 flex items-center justify-center">
                <Icon size={20} color="currentColor" variant="Bold" />
              </div>
              <p className="mt-4 text-2xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl mt-8 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-800">
          <h2 className="font-bold text-white">Newest vendors</h2>
        </div>

        {!recentVendors || recentVendors.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No vendors have signed up yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Plan</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {recentVendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td className="px-6 py-4 text-white font-medium">
                      {vendor.name}
                    </td>
                    <td className="px-6 py-4 text-gray-300 capitalize">
                      {vendor.plan}
                    </td>
                    <td className="px-6 py-4 text-gray-400 capitalize">
                      {vendor.plan_status.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(vendor.created_at)}
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
