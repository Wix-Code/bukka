import { cache } from "react";

import { createSupabaseAdminClient } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/server";
import { MENU_TABLE } from "./vendors";

/* ------------------------------------------------------------------
   STOPGAP for lib/vendors.ts

   Your original lib/vendors.ts (getVendorBySlug, getVendorMenu,
   recordPageView) was overwritten by mistake. This is a rebuild based on
   how app/vendor/[slug]/page.tsx uses those three functions. Restoring
   your original from git or your editor's local history is better. If you
   get it back, delete this file.

   Save this file as lib/vendors.ts, then confirm:
   - MENU_TABLE (set at the top of lib/vendor-directory.ts) is the table
     that holds your dishes, linked to vendors by a vendor_id column.
   - PAGE_VIEWS_TABLE below is where you record page views, if you do.
     A wrong name never breaks the page, it only logs an error.
------------------------------------------------------------------- */

const PAGE_VIEWS_TABLE = "page_views";

// cache() so generateMetadata and the page share one query per request.
export const getVendorBySlug = cache(async (slug: string) => {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Could not load vendor:", error.message);
    return null;
  }

  return data;
});

// Loose on purpose: the page and MenuSection decide what a dish looks like.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

export async function getVendorMenu(vendorId: string): Promise<AnyRow[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from(MENU_TABLE)
    .select("*")
    .eq("vendor_id", vendorId)
    // A stable order, so pagination never repeats or skips dishes.
    .order("id", { ascending: true });

  if (error) {
    console.error("Could not load menu:", error.message);
    return [];
  }

  return (data ?? []) as AnyRow[];
}

// Runs inside after(), where request cookies are unavailable, so it uses
// the admin client rather than the cookie-based server client.
export async function recordPageView(vendorId: string) {
  try {
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from(PAGE_VIEWS_TABLE)
      .insert({ vendor_id: vendorId });

    if (error) {
      console.error("Could not record page view:", error.message);
    }
  } catch (error) {
    console.error("Could not record page view:", error);
  }
}
