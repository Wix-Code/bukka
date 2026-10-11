import type { Metadata } from "next";
import { notFound } from "next/navigation";

import VendorHeader from "@/components/vendor/VendorHeader";
import { getVendorBySlug, getVendorMenu } from "@/lib/vendors";
import MenuSection from "@/components/reusuable/MenuSection";
import { createSupabaseServerClient } from "@/lib/server";

const FALLBACK_COVER_IMAGE =
  "https://images.unsplash.com/photo-1600891964092-4316c288032e";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const vendor = await getVendorBySlug(slug);

  if (!vendor) return {};

  return {
    title: `${vendor.name} | Bukka`,
    description: vendor.description || `Order from ${vendor.name} on Bukka.`,
  };
}

export default async function VendorPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { category: categoryParam } = await searchParams;

  // Get vendor
  const vendor = await getVendorBySlug(slug);

  if (!vendor) {
    notFound();
  }

  // Get vendor dishes
  const allDishes = await getVendorMenu(vendor.id);

  // Get categories
  const supabase = await createSupabaseServerClient();

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (categoriesError) {
    console.error("Error loading categories:", categoriesError.message);
  }

  const categoryList = categories ?? [];

  // Check if selected category exists
  const selectedCategory = categoryList.some(
    (category) => category.id === categoryParam,
  )
    ? (categoryParam ?? "")
    : "";

  // Filter dishes by category
  const dishes = selectedCategory
    ? allDishes.filter((dish) => dish.category_id === selectedCategory)
    : allDishes;

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
        categories={categoryList}
        selectedCategory={selectedCategory}
        totalItems={dishes.length}
      />

      <footer className="pb-10 text-center">
        <p className="text-xs text-gray-400">Powered by Bukka</p>
      </footer>
    </main>
  );
}
