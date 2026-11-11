import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Dropbox } from "iconsax-react";
import { Sparkles } from "lucide-react";

import EmptyState from "@/components/reusuable/EmptyState";
import Pagination from "@/components/reusuable/PaginationProps";
import { fetchListedVendors } from "@/lib/vendors";
import VendorsToolbar from "@/components/reusuable/VendorToolbar";
import VendorCard from "@/components/reusuable/VendorCard";

export const metadata: Metadata = {
  title: "Food vendors | MyBukka",
  description:
    "Browse every food vendor on MyBukka. Search, filter by location and compare dish prices.",
};

/* ------------------------------------------------------------------
   CONFIG. The menu table, price columns and the status filter that
   decides which vendors are listed live in lib/vendor-directory.ts.
------------------------------------------------------------------- */

const BASE_PATH = "/vendors";
const PAGE_SIZE = 12;

type SortKey = "newest" | "name" | "price_asc" | "price_desc";

const SORT_OPTIONS: { value: SortKey; label: string; needsPrices: boolean }[] =
  [
    { value: "newest", label: "Newest first", needsPrices: false },
    { value: "name", label: "Name, A to Z", needsPrices: false },
    { value: "price_asc", label: "Price: low to high", needsPrices: true },
    { value: "price_desc", label: "Price: high to low", needsPrices: true },
  ];

const BUDGET_OPTIONS = [2000, 5000, 10000];

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

/* ------------------------------------------------------------------
   HELPERS
------------------------------------------------------------------- */

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

  const {
    vendors: allVendors,
    vendorsError,
    pricesEnabled,
  } = await fetchListedVendors();

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
        {vendorsError && (
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
