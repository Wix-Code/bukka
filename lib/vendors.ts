// import { cache } from "react";
// import { supabase } from "@/lib/supabase";

// export type Vendor = {
//   id: string;
//   slug: string;
//   name: string;
//   description: string;
//   location: string;
//   opening_hours: string;
//   phone: string;
//   cover_image: string;
//   plan: string;
// };

// export type Dish = {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   image: string;
//   available: boolean;
// };

// // Wrapped in cache() so generateMetadata and the page component can both
// // call this for the same request without hitting Supabase twice.
// export const getVendorBySlug = cache(async (slug: string) => {
//   const { data, error } = await supabase
//     .from("vendors")
//     .select("*")
//     .eq("slug", slug)
//     .single();

//   if (error || !data) return null;
//   return data as Vendor;
// });

// export async function getVendorMenu(vendorId: string) {
//   const { data, error } = await supabase
//     .from("menu_items")
//     .select("*")
//     .eq("vendor_id", vendorId)
//     .eq("available", true)
//     .order("created_at", { ascending: true });

//   if (error || !data) return [];
//   return data as Dish[];
// }

import { cache } from "react";
import { supabase } from "@/lib/supabase";

export type Vendor = {
  id: string;
  slug: string;
  name: string;
  description: string;
  location: string;
  opening_hours: string;
  phone: string;
  cover_image: string;
  plan: string;
};

export type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
};

// Wrapped in cache() so generateMetadata and the page component can both
// call this for the same request without hitting Supabase twice.
export const getVendorBySlug = cache(async (slug: string) => {
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data as Vendor;
});

export async function recordPageView(vendorId: string) {
  // Best-effort — a failed write here should never affect the customer's
  // page load, so the error is swallowed rather than surfaced.
  await supabase.from("page_views").insert({ vendor_id: vendorId });
}

export async function getVendorMenu(vendorId: string) {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("vendor_id", vendorId)
    .eq("available", true)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as Dish[];
}