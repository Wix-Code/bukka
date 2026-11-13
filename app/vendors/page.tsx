import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Dropbox } from "iconsax-react";
import { Sparkles } from "lucide-react";

import EmptyState from "@/components/reusuable/EmptyState";
import Pagination from "@/components/reusuable/PaginationProps";
import VendorsToolbar from "@/components/reusuable/VendorToolbar";
import VendorCard from "@/components/reusuable/VendorCard";

import { fetchListedVendors, type Vendor } from "@/lib/vendors";

export const metadata: Metadata = {
  title: "Food vendors | MyBukka",
  description:
    "Browse every food vendor on MyBukka. Search, filter by location, compare dish prices and discover dine-in restaurants.",
};

/* ------------------------------------------------------------------
   CONFIG
------------------------------------------------------------------- */

const PAGE_SIZE = 12;

type SortKey = "newest" | "name" | "price_asc" | "price_desc";
type DineInFilter = "all" | "yes" | "no";

const SORT_OPTIONS: {
  value: SortKey;
  label: string;
  needsPrices: boolean;
}[] = [
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
  country?: string;
  state?: string;
  lga?: string;
  city?: string;
  sort?: string;
  under?: string;
  dine_in?: string;
};

type LocationOption = {
  name: string;
  count: number;
};

type LocationField = "country" | "state" | "lga" | "city";

/* ------------------------------------------------------------------
   HELPERS
------------------------------------------------------------------- */

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function buildHref({
  page,
  q,
  country,
  state,
  lga,
  city,
  sort,
  under,
  dineIn,
}: {
  page: number;
  q: string;
  country: string;
  state: string;
  lga: string;
  city: string;
  sort: SortKey;
  under: number | null;
  dineIn: DineInFilter;
}) {
  const params = new URLSearchParams();

  if (page > 1) params.set("page", String(page));
  if (q) params.set("q", q);

  if (country) params.set("country", country);
  if (state) params.set("state", state);
  if (lga) params.set("lga", lga);
  if (city) params.set("city", city);

  if (sort !== "newest") params.set("sort", sort);
  if (under !== null) params.set("under", String(under));

  if (dineIn === "yes") {
    params.set("dine_in", "true");
  } else if (dineIn === "no") {
    params.set("dine_in", "false");
  }

  const query = params.toString();

  return query ? `?${query}` : "?";
}

/**
 * Creates location dropdown options from the vendors currently
 * available in the database.
 *
 * The matches callback allows each location level to depend on
 * the selections made above it.
 */
function getLocationOptions(
  vendors: Vendor[],
  field: LocationField,
  matches: (vendor: Vendor) => boolean = () => true,
): LocationOption[] {
  const map = new Map<string, LocationOption>();

  for (const vendor of vendors) {
    if (!matches(vendor)) continue;

    const name = (vendor[field] ?? "").trim();

    if (!name) continue;

    const key = name.toLowerCase();
    const existing = map.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      map.set(key, {
        name,
        count: 1,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
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

  /* --------------------------------------------------------------
     READ AND VALIDATE URL STATE
  -------------------------------------------------------------- */

  const q = (params.q ?? "").trim().slice(0, 80);

  const country = (params.country ?? "").trim();
  const state = (params.state ?? "").trim();
  const lga = (params.lga ?? "").trim();
  const city = (params.city ?? "").trim();

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

  const dineIn: DineInFilter =
    params.dine_in === "true"
      ? "yes"
      : params.dine_in === "false"
        ? "no"
        : "all";

  const parsedPage = Number.parseInt(params.page ?? "1", 10);

  const currentPage =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  /* --------------------------------------------------------------
     LOCATION FILTER OPTIONS

     Country -> State -> LGA -> City

     Each dropdown only shows locations that have vendors matching
     the selections above it.
  -------------------------------------------------------------- */

  const countries = getLocationOptions(allVendors, "country");

  const states = getLocationOptions(
    allVendors,
    "state",
    (vendor) => !country || normalize(vendor.country) === normalize(country),
  );

  const lgas = getLocationOptions(allVendors, "lga", (vendor) => {
    const matchesCountry =
      !country || normalize(vendor.country) === normalize(country);

    const matchesState = !state || normalize(vendor.state) === normalize(state);

    return matchesCountry && matchesState;
  });

  const cities = getLocationOptions(allVendors, "city", (vendor) => {
    const matchesCountry =
      !country || normalize(vendor.country) === normalize(country);

    const matchesState = !state || normalize(vendor.state) === normalize(state);

    const matchesLga = !lga || normalize(vendor.lga) === normalize(lga);

    return matchesCountry && matchesState && matchesLga;
  });

  /* --------------------------------------------------------------
     FILTER VENDORS
  -------------------------------------------------------------- */

  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);

  const filtered = allVendors.filter((vendor) => {
    // Country
    if (country && normalize(vendor.country) !== normalize(country)) {
      return false;
    }

    // State
    if (state && normalize(vendor.state) !== normalize(state)) {
      return false;
    }

    // LGA
    if (lga && normalize(vendor.lga) !== normalize(lga)) {
      return false;
    }

    // City
    if (city && normalize(vendor.city) !== normalize(city)) {
      return false;
    }

    // Budget
    if (under !== null && !(vendor.stats && vendor.stats.min <= under)) {
      return false;
    }

    // Dine-in
    if (dineIn === "yes" && !vendor.has_dine_in) {
      return false;
    }

    if (dineIn === "no" && vendor.has_dine_in) {
      return false;
    }

    // Search
    if (tokens.length > 0) {
      const haystack = `
        ${vendor.name}
        ${vendor.slug}
        ${vendor.location ?? ""}
        ${vendor.country ?? ""}
        ${vendor.state ?? ""}
        ${vendor.lga ?? ""}
        ${vendor.city ?? ""}
        ${vendor.dishText}
      `.toLowerCase();

      if (!tokens.every((token) => haystack.includes(token))) {
        return false;
      }
    }

    return true;
  });

  /* --------------------------------------------------------------
     SORT VENDORS
  -------------------------------------------------------------- */

  filtered.sort((a, b) => {
    if (sort === "name") {
      return a.name.localeCompare(b.name);
    }

    if (sort === "price_asc" || sort === "price_desc") {
      const priceA = a.stats?.avg ?? null;
      const priceB = b.stats?.avg ?? null;

      if (priceA === null && priceB === null) {
        return a.name.localeCompare(b.name);
      }

      if (priceA === null) return 1;
      if (priceB === null) return -1;

      return sort === "price_asc" ? priceA - priceB : priceB - priceA;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  /* --------------------------------------------------------------
     PAGINATION
  -------------------------------------------------------------- */

  const totalRecords = filtered.length;

  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

  if (totalRecords > 0 && currentPage > totalPages) {
    redirect(
      buildHref({
        page: totalPages,
        q,
        country,
        state,
        lga,
        city,
        sort,
        under,
        dineIn,
      }),
    );
  }

  const from = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(from, from + PAGE_SIZE);

  function createPageHref(page: number) {
    return buildHref({
      page,
      q,
      country,
      state,
      lga,
      city,
      sort,
      under,
      dineIn,
    });
  }

  /* --------------------------------------------------------------
     PAGE METADATA
  -------------------------------------------------------------- */

  const hasFilters = Boolean(
    q || country || state || lga || city || under !== null || dineIn !== "all",
  );

  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === sort)?.label ??
    "Newest first";

  const totalDishes = allVendors.reduce(
    (sum, vendor) => sum + (vendor.stats?.count ?? 0),
    0,
  );

  const dineInCount = allVendors.filter((vendor) => vendor.has_dine_in).length;

  /* --------------------------------------------------------------
     RENDER
  -------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-[#FBFAF6] pb-20">
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[#0C3B26] pb-28 pt-16 text-white sm:pb-36 sm:pt-28">
        {/* Photo: put yours at /public/images/vendors-hero.jpg */}
        <img
          src="/images/buk.png"
          alt=""
          aria-hidden
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />

        {/* Brand-colour overlay */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0C3B26]/90 via-[#0C3B26]/80 to-[#0C3B26]/90 sm:bg-gradient-to-r sm:from-[#0C3B26] sm:via-[#0C3B26]/80 sm:to-[#0C3B26]/15"
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-green-100 ring-1 ring-white/20 backdrop-blur">
            <Sparkles size={14} />
            Fresh meals from trusted local kitchens
          </span>

          <h1 className="animate-fade-up mt-6 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
            Find your next favourite{" "}
            <span className="bg-gradient-to-r from-green-300 to-amber-200 bg-clip-text text-transparent">
              bukka
            </span>
            .
          </h1>

          <p
            className="animate-fade-up mt-5 max-w-xl text-base text-green-50/85 sm:text-lg"
            style={{ animationDelay: "80ms" }}
          >
            Browse food vendors, discover dine-in restaurants, compare dish
            prices and open any menu in one tap.
          </p>

          {/* One frosted strip instead of separate pills */}
          <dl
            className="animate-fade-up mt-10 inline-grid max-w-full grid-flow-col divide-x divide-white/15 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md"
            style={{ animationDelay: "160ms" }}
          >
            {[
              { value: allVendors.length, label: "Vendors" },
              { value: cities.length, label: "Cities" },
              { value: dineInCount, label: "Dine-in" },
              ...(pricesEnabled
                ? [{ value: totalDishes, label: "Dishes" }]
                : []),
            ].map((stat) => (
              <div key={stat.label} className="px-5 py-3.5 sm:px-8 sm:py-4">
                <dd className="text-xl font-bold leading-none sm:text-3xl">
                  {stat.value.toLocaleString("en-NG")}
                </dd>
                <dt className="mt-1.5 text-[11px] uppercase tracking-wider text-green-100/80 sm:text-xs">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* TOOLBAR */}
      <section className="relative z-10 mx-auto -mt-14 max-w-6xl px-4 sm:px-6">
        <VendorsToolbar
          initial={{
            q,
            country,
            state,
            lga,
            city,
            sort,
            under,
            dineIn,
          }}
          defaultSort="newest"
          countries={countries}
          states={states}
          lgas={lgas}
          cities={cities}
          sortOptions={SORT_OPTIONS.filter(
            (option) => pricesEnabled || !option.needsPrices,
          ).map(({ value, label }) => ({
            value,
            label,
          }))}
          budgetOptions={pricesEnabled ? BUDGET_OPTIONS : []}
        />
      </section>

      {/* RESULTS */}
      <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6">
        {/* {vendorsError && (
          <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            Couldn&apos;t load vendors right now. Please try again shortly.
          </div>
        )} */}

        {pageItems.length === 0 ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-12 shadow-sm">
            <EmptyState
              icon={<Dropbox size={28} color="#16A34A" />}
              title={hasFilters ? "No matching vendors" : "No vendors yet"}
              description={
                hasFilters
                  ? "Try a different search, another country, state, LGA or city, a different dine-in option or a higher budget."
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

        {/* PAGINATION */}
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
   HERO STAT
------------------------------------------------------------------- */

function HeroStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-2.5 ring-1 ring-white/15 backdrop-blur">
      <span className="text-lg font-bold">{value.toLocaleString("en-NG")}</span>

      <span className="ml-1.5 text-sm text-green-100/80">{label}</span>
    </div>
  );
}
