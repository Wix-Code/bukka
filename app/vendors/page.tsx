import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Dropbox } from "iconsax-react";
import { ArrowUpRight, MapPin, Sparkles, UtensilsCrossed } from "lucide-react";

import EmptyState from "@/components/reusuable/EmptyState";
import Pagination from "@/components/reusuable/PaginationProps";

import { createSupabaseAdminClient } from "@/lib/admin";
import VendorsToolbar from "@/components/reusuable/VendorToolbar";

export const metadata: Metadata = {
  title: "Food vendors | MyBukka",
  description:
    "Browse every food vendor on MyBukka. Search, filter by location and compare dish prices.",
};

/* ------------------------------------------------------------------
   CONFIG. Adjust these if your schema differs.
   Prices are assumed to be stored in naira.
------------------------------------------------------------------- */

const BASE_PATH = "/vendors";
const PAGE_SIZE = 12;

// TODO: status filter is switched off, so every vendor is listed for now.
// Re-enable this and the `.in("plan_status", ...)` line in the query below
// to show only vendors with these plan_status values publicly.
// const LISTED_STATUSES = ["active"];

// Menu table used for price sorting, price filtering and dish search.
const MENU_TABLE = "menu_items";
const MENU_PRICE_COLUMN = "price";
const MENU_NAME_COLUMN = "name";

const DB_BATCH = 1000;
const MAX_BATCHES = 50;

type SortKey = "newest" | "name" | "price_asc" | "price_desc";

const SORT_OPTIONS: { value: SortKey; label: string; needsPrices: boolean }[] =
  [
    { value: "newest", label: "Newest first", needsPrices: false },
    { value: "name", label: "Name, A to Z", needsPrices: false },
    { value: "price_asc", label: "Price: low to high", needsPrices: true },
    { value: "price_desc", label: "Price: high to low", needsPrices: true },
  ];

const BUDGET_OPTIONS = [2000, 5000, 10000];

const AVATAR_GRADIENTS = [
  "from-orange-400 to-rose-500",
  "from-emerald-400 to-green-600",
  "from-amber-300 to-orange-500",
  "from-lime-400 to-emerald-600",
  "from-rose-400 to-pink-600",
  "from-teal-400 to-cyan-600",
];

/* ------------------------------------------------------------------
   TYPES
------------------------------------------------------------------- */

type SearchParams = {
  page?: string;
  q?: string;
  location?: string;
  sort?: string;
  under?: string;
};

type VendorRow = {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  cover_image: string | null;
  created_at: string;
};

type PriceStats = {
  min: number;
  max: number;
  avg: number;
  count: number;
};

type Vendor = VendorRow & {
  stats: PriceStats | null;
  dishText: string;
};

type DishIndexEntry = {
  min: number;
  max: number;
  sum: number;
  count: number;
  names: string[];
};

/* ------------------------------------------------------------------
   HELPERS
------------------------------------------------------------------- */

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function formatNaira(value: number) {
  return nairaFormatter.format(value);
}

function hashString(value: string) {
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  return hash;
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "V";
}

function buildHref({
  page,
  q,
  location,
  sort,
  under,
}: {
  page: number;
  q: string;
  location: string;
  sort: SortKey;
  under: number | null;
}) {
  const params = new URLSearchParams();

  if (page > 1) params.set("page", String(page));
  if (q) params.set("q", q);
  if (location) params.set("location", location);
  if (sort !== "newest") params.set("sort", sort);
  if (under !== null) params.set("under", String(under));

  const query = params.toString();

  return query ? `${BASE_PATH}?${query}` : BASE_PATH;
}

async function loadDishes(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
): Promise<{ rows: Record<string, unknown>[]; error: string | null }> {
  const rows: Record<string, unknown>[] = [];

  for (let batch = 0; batch < MAX_BATCHES; batch += 1) {
    const from = batch * DB_BATCH;

    const { data, error } = await supabase
      .from(MENU_TABLE)
      .select(`vendor_id, ${MENU_PRICE_COLUMN}, ${MENU_NAME_COLUMN}`)
      .order("id")
      .range(from, from + DB_BATCH - 1);

    if (error) {
      return { rows: [], error: error.message };
    }

    const chunk = (data ?? []) as unknown as Record<string, unknown>[];
    rows.push(...chunk);

    if (chunk.length < DB_BATCH) break;
  }

  return { rows, error: null };
}

function buildDishIndex(rows: Record<string, unknown>[]) {
  const index = new Map<string, DishIndexEntry>();

  for (const row of rows) {
    const vendorId = String(row.vendor_id ?? "");
    if (!vendorId) continue;

    let entry = index.get(vendorId);

    if (!entry) {
      entry = { min: Infinity, max: 0, sum: 0, count: 0, names: [] };
      index.set(vendorId, entry);
    }

    const name = row[MENU_NAME_COLUMN];
    if (typeof name === "string" && name) entry.names.push(name);

    const price = Number(row[MENU_PRICE_COLUMN]);

    if (Number.isFinite(price) && price > 0) {
      entry.min = Math.min(entry.min, price);
      entry.max = Math.max(entry.max, price);
      entry.sum += price;
      entry.count += 1;
    }
  }

  return index;
}

/* ------------------------------------------------------------------
   PAGE
------------------------------------------------------------------- */

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const now = Date.now();

  const supabase = createSupabaseAdminClient();

  const [vendorsResult, dishesResult] = await Promise.all([
    supabase
      .from("vendors")
      .select("id, name, slug, location, cover_image, created_at")
      // TODO: re-enable later to list only active vendors.
      // .in("plan_status", LISTED_STATUSES)
      .not("slug", "is", null),
    loadDishes(supabase),
  ]);

  if (vendorsResult.error) {
    console.error("Vendors query failed:", vendorsResult.error.message);
  }

  if (dishesResult.error) {
    console.error(
      "Menu query failed, price features are disabled:",
      dishesResult.error,
    );
  }

  const pricesEnabled = !dishesResult.error;
  const dishIndex = buildDishIndex(dishesResult.rows);

  const allVendors: Vendor[] = (
    (vendorsResult.data ?? []) as unknown as VendorRow[]
  ).map((vendor) => {
    const entry = dishIndex.get(vendor.id);

    return {
      ...vendor,
      stats:
        entry && entry.count > 0
          ? {
              min: entry.min,
              max: entry.max,
              avg: Math.round(entry.sum / entry.count),
              count: entry.count,
            }
          : null,
      dishText: entry ? entry.names.join(" ").toLowerCase() : "",
    };
  });

  /* ---- read and validate URL state ---- */

  const q = (params.q ?? "").trim().slice(0, 80);
  const location = (params.location ?? "").trim();

  const requestedSort = SORT_OPTIONS.find(
    (option) => option.value === params.sort,
  );
  const sort: SortKey =
    requestedSort && (pricesEnabled || !requestedSort.needsPrices)
      ? requestedSort.value
      : "newest";

  const underNumber = Number(params.under);
  const under =
    pricesEnabled && BUDGET_OPTIONS.includes(underNumber) ? underNumber : null;

  const currentPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  /* ---- locations for the filter dropdown ---- */

  const locationMap = new Map<string, { name: string; count: number }>();

  for (const vendor of allVendors) {
    const name = (vendor.location ?? "").trim();
    if (!name) continue;

    const key = name.toLowerCase();
    const existing = locationMap.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      locationMap.set(key, { name, count: 1 });
    }
  }

  const locations = Array.from(locationMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  /* ---- filter ---- */

  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);

  const filtered = allVendors.filter((vendor) => {
    if (
      location &&
      (vendor.location ?? "").trim().toLowerCase() !== location.toLowerCase()
    ) {
      return false;
    }

    if (under !== null && !(vendor.stats && vendor.stats.min <= under)) {
      return false;
    }

    if (tokens.length > 0) {
      const haystack =
        `${vendor.name} ${vendor.slug} ${vendor.location ?? ""} ${vendor.dishText}`.toLowerCase();

      if (!tokens.every((token) => haystack.includes(token))) return false;
    }

    return true;
  });

  /* ---- sort ---- */

  filtered.sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);

    if (sort === "price_asc" || sort === "price_desc") {
      const priceA = a.stats?.avg ?? null;
      const priceB = b.stats?.avg ?? null;

      if (priceA === null && priceB === null)
        return a.name.localeCompare(b.name);
      if (priceA === null) return 1;
      if (priceB === null) return -1;

      return sort === "price_asc" ? priceA - priceB : priceB - priceA;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  /* ---- paginate ---- */

  const totalRecords = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

  if (totalRecords > 0 && currentPage > totalPages) {
    redirect(buildHref({ page: totalPages, q, location, sort, under }));
  }

  const from = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(from, from + PAGE_SIZE);

  function createPageHref(page: number) {
    return buildHref({ page, q, location, sort, under });
  }

  const hasFilters = Boolean(q || location || under !== null);
  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === sort)?.label ??
    "Newest first";

  const totalDishes = allVendors.reduce(
    (sum, vendor) => sum + (vendor.stats?.count ?? 0),
    0,
  );

  return (
    <main className="min-h-screen bg-[#FBFAF6] pb-20">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0C3B26] pb-28 pt-16 text-white sm:pb-32 sm:pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          aria-hidden
          className="animate-blob pointer-events-none absolute -left-24 -top-28 h-96 w-96 rounded-full bg-green-500/30 blur-3xl"
        />
        <div
          aria-hidden
          className="animate-blob pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-green-100 ring-1 ring-white/15 backdrop-blur">
            <Sparkles size={14} />
            Fresh meals from trusted local kitchens
          </span>

          <h1 className="animate-fade-up mt-6 max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            Find your next favourite{" "}
            <span className="bg-gradient-to-r from-green-300 to-amber-200 bg-clip-text text-transparent">
              bukka
            </span>
            .
          </h1>

          <p
            className="animate-fade-up mt-5 max-w-xl text-base text-green-50/80 sm:text-lg"
            style={{ animationDelay: "80ms" }}
          >
            Browse every vendor, compare dish prices and open any menu in one
            tap.
          </p>

          <div
            className="animate-fade-up mt-8 flex flex-wrap gap-3"
            style={{ animationDelay: "160ms" }}
          >
            <HeroStat value={allVendors.length} label="vendors" />
            <HeroStat value={locations.length} label="locations" />
            {pricesEnabled && <HeroStat value={totalDishes} label="dishes" />}
          </div>
        </div>
      </section>

      {/* TOOLBAR */}
      <section className="relative z-10 mx-auto -mt-14 max-w-6xl px-4 sm:px-6">
        <VendorsToolbar
          basePath={BASE_PATH}
          initial={{ q, location, sort, under }}
          defaultSort="newest"
          locations={locations}
          sortOptions={SORT_OPTIONS.filter(
            (option) => pricesEnabled || !option.needsPrices,
          ).map(({ value, label }) => ({ value, label }))}
          budgetOptions={pricesEnabled ? BUDGET_OPTIONS : []}
        />
      </section>

      {/* RESULTS */}
      <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6">
        {vendorsResult.error && (
          <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            Couldn&apos;t load vendors right now. Please try again shortly.
          </div>
        )}

        {pageItems.length === 0 ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-12 shadow-sm">
            <EmptyState
              icon={<Dropbox size={28} color="#16A34A" />}
              title={hasFilters ? "No matching vendors" : "No vendors yet"}
              description={
                hasFilters
                  ? "Try a different search, another location or a higher budget."
                  : "Vendors will show up here as soon as they go live."
              }
            />
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-stone-500">
                Showing{" "}
                <span className="font-semibold text-stone-900">
                  {from + 1} to {from + pageItems.length}
                </span>{" "}
                of {totalRecords.toLocaleString("en-NG")} vendors
              </p>

              <p className="text-xs text-stone-400">Sorted by {sortLabel}</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((vendor, index) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  index={index}
                  isNew={
                    now - new Date(vendor.created_at).getTime() <
                    30 * 24 * 60 * 60 * 1000
                  }
                />
              ))}
            </div>
          </>
        )}

        {totalRecords > PAGE_SIZE && (
          <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              createPageHref={createPageHref}
            />
          </div>
        )}
      </section>
    </main>
  );
}

/* ------------------------------------------------------------------
   PIECES
------------------------------------------------------------------- */

function HeroStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-2.5 ring-1 ring-white/15 backdrop-blur">
      <span className="text-lg font-bold">{value.toLocaleString("en-NG")}</span>
      <span className="ml-1.5 text-sm text-green-100/80">{label}</span>
    </div>
  );
}

function VendorCard({
  vendor,
  index,
  isNew,
}: {
  vendor: Vendor;
  index: number;
  isNew: boolean;
}) {
  const gradient =
    AVATAR_GRADIENTS[hashString(vendor.name) % AVATAR_GRADIENTS.length];

  const { stats } = vendor;

  return (
    <Link
      href={`/vendor/${vendor.slug}`}
      className="animate-fade-up group flex flex-col rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl hover:shadow-green-900/5"
      style={{ animationDelay: `${(index % PAGE_SIZE) * 45}ms` }}
    >
      <div className="flex items-start gap-4">
        <div
          className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} text-lg font-bold text-white shadow-inner`}
        >
          {initialsOf(vendor.name)}

          {vendor.cover_image && (
            // Sits on top of the initials, so a broken URL falls back to them.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vendor.cover_image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-stone-900">
              {vendor.name}
            </h3>

            {isNew && (
              <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                New
              </span>
            )}
          </div>

          <p className="mt-1 flex items-center gap-1 text-sm text-stone-500">
            <MapPin size={14} className="shrink-0 text-stone-400" />
            <span className="truncate">
              {vendor.location?.trim() || "Location not set"}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-5 flex-1 rounded-2xl bg-stone-50 p-4">
        {stats ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
              Average dish price
            </p>

            <p className="mt-1 text-2xl font-bold text-stone-900">
              {formatNaira(stats.avg)}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-green-50 px-2.5 py-1 font-medium text-green-700">
                {stats.min === stats.max
                  ? formatNaira(stats.min)
                  : `${formatNaira(stats.min)} to ${formatNaira(stats.max)}`}
              </span>

              <span className="text-stone-400">
                {stats.count} {stats.count === 1 ? "dish" : "dishes"}
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full min-h-[84px] flex-col items-center justify-center gap-1.5 text-stone-400">
            <UtensilsCrossed size={20} />
            <p className="text-xs">Menu coming soon</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
        <span className="text-sm font-semibold text-green-700">View menu</span>

        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-700 transition group-hover:bg-green-600 group-hover:text-white">
          <ArrowUpRight size={16} />
        </span>
      </div>
    </Link>
  );
}
