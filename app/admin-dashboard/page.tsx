import { createSupabaseAdminClient } from "@/lib/admin";
import { Shop, Bag2, Wallet2, Chart2 } from "iconsax-react";
import Link from "next/link";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const planStatusStyles: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  inactive: "bg-gray-100 text-gray-500",
  past_due: "bg-yellow-50 text-yellow-700",
  cancelled: "bg-red-50 text-red-700",
};

export default async function AdminOverview() {
  // Uses the service-role client deliberately — this page reads across
  // every vendor, which ordinary RLS policies correctly refuse to allow.
  // Admin membership is already confirmed by the layout above this page.
  const supabase = createSupabaseAdminClient();

  const [
    { count: vendorCount, error: vendorCountError },
    { count: activeSubCount },
    { count: orderCount },
    { data: invoices },
    { data: recentVendors, error: recentVendorsError },
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

  // Surface the real error instead of silently rendering an empty state —
  // this is almost always a missing/wrong SUPABASE_SERVICE_ROLE_KEY.
  const queryError = vendorCountError?.message || recentVendorsError?.message;
  if (queryError) console.error("Admin overview query failed:", queryError);

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
    { label: "Total orders", value: (orderCount ?? 0).toString(), icon: Bag2 },
    {
      label: "Total revenue",
      value: `₦${totalRevenue.toLocaleString()}`,
      icon: Wallet2,
    },
  ];

  return (
    <div>
      <p className="text-gray-500 mb-8">Platform-wide, across every vendor.</p>

      {queryError && (
        <div className="mb-6 rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">
          Couldn&rsquo;t load platform data: {queryError}
          <br />
          <span className="text-red-600/70">
            This usually means SUPABASE_SERVICE_ROLE_KEY is missing, wrong, or
            the dev server needs a restart after adding it.
          </span>
        </div>
      )}

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

      <div className="bg-white rounded-2xl shadow-sm mt-8 overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Newest vendors</h2>
          <Link
            className="text-sm text-green-700 hover:text-green-800 underline underline-offset-2"
            href={"/admin-dashboard/vendors"}
          >
            View All
          </Link>
        </div>

        {!recentVendors || recentVendors.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {queryError
              ? "Couldn't load vendors — see the error above."
              : "No vendors have signed up yet."}
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
              <tbody className="divide-y divide-gray-100">
                {recentVendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {vendor.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 capitalize">
                      {vendor.plan}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          planStatusStyles[vendor.plan_status] ??
                          planStatusStyles.inactive
                        }`}
                      >
                        {vendor.plan_status.replace("_", " ")}
                      </span>
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
