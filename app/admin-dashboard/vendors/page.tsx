import Link from "next/link";
import { redirect } from "next/navigation";

import EmptyState from "@/components/reusuable/EmptyState";
import Pagination from "@/components/reusuable/PaginationProps";

import { createSupabaseAdminClient } from "@/lib/admin";

import { Dropbox } from "iconsax-react";

import { AlertCircle, CheckCircle2, Store, XCircle } from "lucide-react";
import AdminVendorsToolbar from "@/components/admin-dashboard/vendors/AdminVendorsToolbar";

const PAGE_SIZE = 10;

const planStatusStyles: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  inactive: "bg-gray-100 text-gray-500",
  past_due: "bg-yellow-50 text-yellow-700",
  cancelled: "bg-red-50 text-red-700",
};

type VendorStatus = "all" | "active" | "inactive" | "past_due" | "cancelled";

type SearchParams = {
  page?: string;
  search?: string;
  status?: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/*
 * Protect the PostgREST .or() expression
 * from characters that can break its syntax.
 */
function cleanSearch(value: string) {
  return value.replace(/[(),]/g, " ").replace(/\s+/g, " ").trim();
}

function buildVendorsHref({
  page,
  search,
  status,
}: {
  page: number;
  search: string;
  status: VendorStatus;
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

  return query ? `/admin/vendors?${query}` : "/admin/vendors";
}

export default async function AdminVendorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const currentPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const search = cleanSearch(params.search ?? "");

  const status: VendorStatus =
    params.status === "active" ||
    params.status === "inactive" ||
    params.status === "past_due" ||
    params.status === "cancelled"
      ? params.status
      : "all";

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createSupabaseAdminClient();

  /*
   * PLATFORM-WIDE STATISTICS
   */
  const [totalResult, activeResult, pastDueResult, cancelledResult] =
    await Promise.all([
      supabase.from("vendors").select("id", {
        count: "exact",
        head: true,
      }),

      supabase
        .from("vendors")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("plan_status", "active"),

      supabase
        .from("vendors")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("plan_status", "past_due"),

      supabase
        .from("vendors")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("plan_status", "cancelled"),
    ]);

  /*
   * MAIN VENDOR QUERY
   */
  let vendorsQuery = supabase
    .from("vendors")
    .select(
      `
        id,
        name,
        slug,
        plan,
        plan_status,
        phone,
        location,
        created_at
      `,
      {
        count: "exact",
      },
    )
    .order("created_at", {
      ascending: false,
    });

  /*
   * Search vendor fields
   */
  if (search) {
    vendorsQuery = vendorsQuery.or(
      [
        `name.ilike.%${search}%`,
        `slug.ilike.%${search}%`,
        `location.ilike.%${search}%`,
        `phone.ilike.%${search}%`,
      ].join(","),
    );
  }

  /*
   * Status filter
   */
  if (status !== "all") {
    vendorsQuery = vendorsQuery.eq("plan_status", status);
  }

  /*
   * Pagination
   */
  const { data: vendors, count, error } = await vendorsQuery.range(from, to);

  if (error) {
    console.error("Admin vendors query failed:", error.message);
  }

  const totalRecords = count ?? 0;

  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

  /*
   * If a user was on page 5, then filters reduce
   * results to 2 pages, move them to the last
   * valid page instead of displaying an empty table.
   */
  if (!error && totalRecords > 0 && currentPage > totalPages) {
    redirect(
      buildVendorsHref({
        page: totalPages,
        search,
        status,
      }),
    );
  }

  function createPageHref(page: number) {
    return buildVendorsHref({
      page,
      search,
      status,
    });
  }

  return (
    <div>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage and monitor every food business registered on the platform.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total vendors"
          value={totalResult.count ?? 0}
          icon={<Store size={21} />}
          iconClassName="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Active"
          value={activeResult.count ?? 0}
          icon={<CheckCircle2 size={21} />}
          iconClassName="bg-green-50 text-green-600"
        />

        <StatCard
          title="Past due"
          value={pastDueResult.count ?? 0}
          icon={<AlertCircle size={21} />}
          iconClassName="bg-yellow-50 text-yellow-600"
        />

        <StatCard
          title="Cancelled"
          value={cancelledResult.count ?? 0}
          icon={<XCircle size={21} />}
          iconClassName="bg-red-50 text-red-600"
        />
      </div>

      {/* SEARCH + FILTER */}
      <AdminVendorsToolbar initialSearch={search} initialStatus={status} />

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t load vendors: {error.message}
          <br />
          <span className="text-red-600/70">
            Check your Supabase service role key and restart the development
            server if you recently changed environment variables.
          </span>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {!vendors || vendors.length === 0 ? (
          <div className="p-12">
            {error ? (
              <p className="text-center text-sm text-gray-500">
                Couldn&apos;t load vendors. See the error above.
              </p>
            ) : (
              <EmptyState
                icon={<Dropbox size={28} color="#16A34A" />}
                title={
                  search || status !== "all"
                    ? "No matching vendors"
                    : "No vendors available"
                }
                description={
                  search || status !== "all"
                    ? "Try another search term or change the status filter."
                    : "Registered food vendors will appear here."
                }
              />
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-gray-500">
                  <th className="px-6 py-4 font-medium">Name</th>

                  <th className="px-6 py-4 font-medium">Location</th>

                  <th className="px-6 py-4 font-medium">Plan</th>

                  <th className="px-6 py-4 font-medium">Phone</th>

                  <th className="px-6 py-4 font-medium">Status</th>

                  <th className="px-6 py-4 font-medium">Joined</th>

                  <th className="px-6 py-4 font-medium">Menu</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {vendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="transition-colors hover:bg-gray-50/70"
                  >
                    {/* NAME */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {vendor.name}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-400">
                          /{vendor.slug}
                        </p>
                      </div>
                    </td>

                    {/* LOCATION */}
                    <td className="px-6 py-4 text-gray-600">
                      {vendor.location || "—"}
                    </td>

                    {/* PLAN */}
                    <td className="px-6 py-4">
                      <span className="capitalize text-gray-600">
                        {vendor.plan || "—"}
                      </span>
                    </td>

                    {/* PHONE */}
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      {vendor.phone || "—"}
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                          planStatusStyles[vendor.plan_status] ??
                          planStatusStyles.inactive
                        }`}
                      >
                        {vendor.plan_status?.replaceAll("_", " ") ?? "Inactive"}
                      </span>
                    </td>

                    {/* JOINED */}
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                      {formatDate(vendor.created_at)}
                    </td>

                    {/* MENU */}
                    <td className="px-6 py-4">
                      {vendor.slug ? (
                        <Link
                          href={`/vendor/${vendor.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-green-700 transition hover:text-green-800 hover:underline hover:underline-offset-4"
                        >
                          View menu
                        </Link>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RESULTS INFORMATION */}
      {!error && vendors && vendors.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-400">
            Showing {from + 1}–{Math.min(from + vendors.length, totalRecords)}{" "}
            of {totalRecords} vendors
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
