import { redirect } from "next/navigation";

import MenuManager from "@/components/dashboard/menu/MenuManager";

import type { Dish } from "@/components/dashboard/menu/DishFormDialog";

import Pagination from "@/components/reusuable/PaginationProps";

import { createSupabaseServerClient } from "@/lib/server";

const PAGE_SIZE = 10;

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;

  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware should already have redirected an unauthenticated request,
  // but this covers direct hits during local dev or a race on session expiry.
  if (!user) redirect("/login");

  const {
    data: dishes,
    count,
    error,
  } = await supabase
    .from("menu_items")
    .select("*", {
      count: "exact",
    })
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div>
      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">
          Couldn&rsquo;t load menu items: {error.message}
        </div>
      )}

      <MenuManager
        vendorId={user.id}
        initialDishes={(dishes as Dish[]) ?? []}
      />

      {dishes && dishes.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            createPageHref={(page) => `/dashboard/menu?page=${page}`}
          />
        </div>
      )}
    </div>
  );
}
