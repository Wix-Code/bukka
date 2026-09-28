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
  active: "bg-green-50 text-green-700",
  inactive: "bg-gray-100 text-gray-500",
  past_due: "bg-yellow-50 text-yellow-700",
  cancelled: "bg-red-50 text-red-700",
};

export default async function AdminVendorsPage() {
  const supabase = createSupabaseAdminClient();

  const { data: vendors, error } = await supabase
    .from("vendors")
    .select("id, name, slug, plan, plan_status, phone, location, created_at")
    .order("created_at", { ascending: false });

  if (error) console.error("Admin vendors query failed:", error.message);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Vendors</h1>
      <p className="text-sm text-gray-500 mb-8">
        Every restaurant on the platform.
      </p>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">
          Couldn&rsquo;t load vendors: {error.message}
          <br />
          <span className="text-red-600/70">
            This usually means SUPABASE_SERVICE_ROLE_KEY is missing, wrong, or
            the dev server needs a restart after adding it.
          </span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {!vendors || vendors.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {error
              ? "Couldn't load vendors — see the error above."
              : "No vendors yet."}
          </div>
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
              <tbody className="divide-y divide-gray-100">
                {vendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {vendor.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {vendor.location || "—"}
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
                    <td className="px-6 py-4">
                      <Link
                        href={`/vendor/${vendor.slug}`}
                        target="_blank"
                        className="text-sm text-green-700 hover:text-green-800 underline underline-offset-2"
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
