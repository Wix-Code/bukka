import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";

import VendorHeader from "@/components/vendor/VendorHeader";
import { getVendorBySlug, getVendorMenu, recordPageView } from "@/lib/vendors";
import { createSupabaseServerClient } from "@/lib/server";
import MenuSection from "@/components/reusuable/MenuSection";
import Pagination from "@/components/reusuable/PaginationProps";

const FALLBACK_COVER_IMAGE =
  "https://images.unsplash.com/photo-1600891964092-4316c288032e";

const PAGE_SIZE = 10;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    category?: string;
  }>;
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

  const { page: pageParam, category: categoryParam } = await searchParams;

  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const vendor = await getVendorBySlug(slug);

  if (!vendor) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();

  // Fetch all available categories
  const { data: categoryRows, error: categoryError } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (categoryError) {
    console.error("Could not load categories:", categoryError.message);
  }

  const categories = categoryRows ?? [];

  const selectedCategory = categories.some(
    (category) => category.id === categoryParam,
  )
    ? categoryParam!
    : "";

  // Fetch the vendor's dishes
  const allDishes = await getVendorMenu(vendor.id);

  after(() => recordPageView(vendor.id));

  // Filter across the entire menu before pagination
  const filteredDishes = selectedCategory
    ? allDishes.filter((dish) => dish.category_id === selectedCategory)
    : allDishes;

  const totalItems = filteredDishes.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const safePage = Math.min(currentPage, totalPages);

  const from = (safePage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;

  const dishes = filteredDishes.slice(from, to);

  function createPageHref(page: number) {
    const params = new URLSearchParams();

    params.set("page", String(page));

    if (selectedCategory) {
      params.set("category", selectedCategory);
    }

    return `/vendor/${encodeURIComponent(slug)}?${params.toString()}`;
  }

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
        categories={categories}
        selectedCategory={selectedCategory}
        totalItems={totalItems}
      />

      <div className="mx-auto max-w-7xl px-6 pb-10">
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          createPageHref={createPageHref}
        />
      </div>

      <footer className="pb-10 text-center">
        <p className="text-xs text-gray-400">Powered by Bukka</p>
      </footer>
    </main>
  );
}
