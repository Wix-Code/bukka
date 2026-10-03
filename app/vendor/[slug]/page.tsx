import type { Metadata } from "next";
import { notFound } from "next/navigation";

import VendorHeader from "@/components/vendor/VendorHeader";
import { getVendorBySlug, getVendorMenu, recordPageView } from "@/lib/vendors";
import MenuSection from "@/components/reusuable/MenuSection";
import Pagination from "@/components/reusuable/PaginationProps";
import { after } from "next/server";

const FALLBACK_COVER_IMAGE =
  "https://images.unsplash.com/photo-1600891964092-4316c288032e";

const PAGE_SIZE = 4;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const vendor = await getVendorBySlug(slug);

  if (!vendor) {
    return {};
  }

  return {
    title: `${vendor.name} | Bukka`,
    description: vendor.description || `Order from ${vendor.name} on Bukka.`,
  };
}

export default async function VendorPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const vendor = await getVendorBySlug(slug);

  if (!vendor) {
    notFound();
  }

  const allDishes = await getVendorMenu(vendor.id);
  after(() => recordPageView(vendor.id));

  const totalPages = Math.max(1, Math.ceil(allDishes.length / PAGE_SIZE));

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;

  const dishes = allDishes.slice(from, to);

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <VendorHeader
        vendor={{
          name: vendor.name,
          description: vendor.description,
          location: vendor.location,
          openingHours: vendor.opening_hours,
          image: vendor.cover_image || FALLBACK_COVER_IMAGE,
        }}
      />

      <MenuSection
        workingHours={vendor.opening_hours}
        dishes={dishes}
        phone={vendor.phone}
        vendorId={vendor.id}
      />

      <div className="mx-auto max-w-7xl px-6 pb-10">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          createPageHref={(page) => `/vendor/${slug}?page=${page}`}
        />
      </div>

      <footer className="pb-10 text-center">
        <p className="text-xs text-gray-400">Powered by Bukka</p>
      </footer>
    </main>
  );
}
