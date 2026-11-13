import { createSupabaseAdminClient } from "@/lib/admin";

/* ------------------------------------------------------------------
   SHARED VENDOR DATA

   Server only: this file uses the Supabase admin client.
   Never import it into a "use client" component.

   Prices are assumed to be stored in naira.
------------------------------------------------------------------- */

// Menu table used for price sorting, price filtering and dish search.
export const MENU_TABLE = "menu_items";

const MENU_PRICE_COLUMN = "price";
const MENU_NAME_COLUMN = "name";

const DB_BATCH = 1000;
const MAX_BATCHES = 50;

/* ------------------------------------------------------------------
   TYPES
------------------------------------------------------------------- */

export type VendorRow = {
  id: string;
  name: string;
  slug: string;
  location: string | null;

  // Structured vendor location.
  country: string | null;
  state: string | null;
  lga: string | null;
  city: string | null;

  cover_image: string | null;
  created_at: string;
  has_dine_in: boolean;
};

export type PriceStats = {
  min: number;
  max: number;
  avg: number;
  count: number;
};

export type Vendor = VendorRow & {
  stats: PriceStats | null;
  dishText: string;
};

export type ListedVendors = {
  vendors: Vendor[];
  vendorsError: string | null;
  pricesEnabled: boolean;
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

async function loadDishes(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
): Promise<{
  rows: Record<string, unknown>[];
  error: string | null;
}> {
  const rows: Record<string, unknown>[] = [];

  for (let batch = 0; batch < MAX_BATCHES; batch += 1) {
    const from = batch * DB_BATCH;

    const { data, error } = await supabase
      .from(MENU_TABLE)
      .select(`vendor_id, ${MENU_PRICE_COLUMN}, ${MENU_NAME_COLUMN}`)
      .order("id")
      .range(from, from + DB_BATCH - 1);

    if (error) {
      return {
        rows: [],
        error: error.message,
      };
    }

    const chunk = (data ?? []) as unknown as Record<string, unknown>[];

    rows.push(...chunk);

    if (chunk.length < DB_BATCH) break;
  }

  return {
    rows,
    error: null,
  };
}

function buildDishIndex(rows: Record<string, unknown>[]) {
  const index = new Map<string, DishIndexEntry>();

  for (const row of rows) {
    const vendorId = String(row.vendor_id ?? "");

    if (!vendorId) continue;

    let entry = index.get(vendorId);

    if (!entry) {
      entry = {
        min: Infinity,
        max: 0,
        sum: 0,
        count: 0,
        names: [],
      };

      index.set(vendorId, entry);
    }

    const name = row[MENU_NAME_COLUMN];

    if (typeof name === "string" && name.trim()) {
      entry.names.push(name.trim());
    }

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
   PUBLIC API
------------------------------------------------------------------- */

/**
 * Fetches every vendor that should appear publicly, together with
 * price statistics and searchable dish names.
 *
 * The landing page and /vendors page should both use this function
 * so they display the same vendor records.
 */
export async function fetchListedVendors(): Promise<ListedVendors> {
  const supabase = createSupabaseAdminClient();

  const [vendorsResult, dishesResult] = await Promise.all([
    supabase
      .from("vendors")
      .select(
        `
          id,
          name,
          slug,
          location,
          country,
          state,
          lga,
          city,
          cover_image,
          created_at,
          has_dine_in
        `,
      )
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

  const dishIndex = buildDishIndex(dishesResult.rows);

  const vendors: Vendor[] = (
    (vendorsResult.data ?? []) as unknown as VendorRow[]
  ).map((vendor) => {
    const entry = dishIndex.get(vendor.id);

    return {
      ...vendor,

      // Protect the frontend if an existing record returns null.
      has_dine_in: vendor.has_dine_in ?? false,

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

  return {
    vendors,
    vendorsError: vendorsResult.error?.message ?? null,
    pricesEnabled: !dishesResult.error,
  };
}
