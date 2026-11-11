import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import { fetchListedVendors, Vendor } from "@/lib/vendors";
import Reveal from "./Reveal";
import VendorCard from "./VendorCard";


/* ----------------------------------------------------------------__
   Landing page section: a few vendors, then a link to the full list.
   Server component, passed into the landing page as a slot.
------------------------------------------------------------------- */

const FEATURED_COUNT = 6;
const VENDORS_HREF = "/vendors";
const NEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

// Vendors with a menu come first (their card shows prices), then ones with
// a cover image, then the biggest menus, then the newest.
function pickFeatured(vendors: Vendor[]) {
  return [...vendors]
    .sort((a, b) => {
      const menu = Number(Boolean(b.stats)) - Number(Boolean(a.stats));
      if (menu) return menu;

      const cover =
        Number(Boolean(b.cover_image)) - Number(Boolean(a.cover_image));
      if (cover) return cover;

      const dishes = (b.stats?.count ?? 0) - (a.stats?.count ?? 0);
      if (dishes) return dishes;

      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    })
    .slice(0, FEATURED_COUNT);
}

export default async function FeaturedVendors() {
  let vendors: Vendor[] = [];

  try {
    const result = await fetchListedVendors();
    if (!result.vendorsError) vendors = result.vendors;
  } catch (error) {
    // The landing page must still load if the database is unreachable.
    console.error("Featured vendors failed to load:", error);
  }

  if (vendors.length === 0) return null;

  const featured = pickFeatured(vendors);
  const now = Date.now();

  return (
    <section className="relative overflow-hidden bg-[#fffdf7] py-24 md:py-32">
      <div className="pointer-events-none absolute -left-40 top-24 h-[420px] w-[420px] rounded-full bg-orange-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-[380px] w-[380px] rounded-full bg-green-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
              <Store size={14} />
              Vendors on Bukka
            </div>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Real menus from real food businesses
            </h2>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-600">
              Take a look at some of the food businesses already using Bukka to
              share their menus and take orders. Tap any card to open their
              menu.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((vendor, index) => (
            <Reveal key={vendor.id} delay={(index % 3) * 0.1} className="grid">
              <VendorCard
                vendor={vendor}
                index={index}
                isNew={
                  now - new Date(vendor.created_at).getTime() < NEW_WINDOW_MS
                }
              />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 flex justify-center">
          <Link
            href={VENDORS_HREF}
            className="group inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-8 py-4 font-medium text-gray-900 transition hover:-translate-y-0.5 hover:border-green-500 hover:text-green-700"
          >
            {vendors.length > featured.length
              ? `View all ${vendors.length.toLocaleString("en-NG")} vendors`
              : "View all vendors"}
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
