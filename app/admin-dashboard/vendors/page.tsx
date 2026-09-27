import { createSupabaseAdminClient } from "@/lib/admin";
import Link from "next/link";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const planStatusStyles: Record<string, string> = {
  active: "bg-green-900/40 text-green-400",
  inactive: "bg-gray-800 text-gray-400",
  past_due: "bg-yellow-900/40 text-yellow-400",
  cancelled: "bg-red-900/40 text-red-400",
};

export default async function AdminVendorsPage() {
  const supabase = createSupabaseAdminClient();

  const { data: vendors } = await supabase
    .from("vendors")
    .select("id, name, slug, plan, plan_status, phone, location, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Vendors</h1>
      <p className="text-sm text-gray-400 mb-8">
        Every restaurant on the platform.
      </p>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {!vendors || vendors.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No vendors yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Location</th>
                  <th className="px-6 py-3 font-medium">Plan</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                  <th className="px-6 py-3 font-medium">Menu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {vendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td className="px-6 py-4 text-white font-medium">
                      {vendor.name}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {vendor.location || "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-300 capitalize">
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
                    <td className="px-6 py-4">
                      <Link
                        href={`/vendor/${vendor.slug}`}
                        target="_blank"
                        className="text-sm text-gray-300 hover:text-white underline underline-offset-2"
                      >
                        View
                      </Link>
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
