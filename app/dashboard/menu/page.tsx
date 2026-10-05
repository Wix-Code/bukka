import { redirect } from "next/navigation";

import MenuManager from "@/components/dashboard/menu/MenuManager";
import type { Dish } from "@/components/dashboard/menu/DishFormDialog";
import Pagination from "@/components/reusuable/PaginationProps";
import { createSupabaseServerClient } from "@/lib/server";
import TrialBanner from "@/components/reusuable/TrialBanner";

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

  // 1. Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch vendor subscription / plan status first
  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id, plan, plan_status, trial_ends_at")
    .eq("id", user.id)
    .single();

  if (vendorError || !vendor) {
    console.error("Vendor fetch failed:", vendorError?.message);
    redirect("/dashboard");
  }

  const now = new Date();

  const trialEndsAt = vendor.trial_ends_at
    ? new Date(vendor.trial_ends_at)
    : null;

  const trialIsActive =
    vendor.plan_status === "trial" && trialEndsAt !== null && trialEndsAt > now;

  const subscriptionIsActive = vendor.plan_status === "active";

  const hasMenuAccess = subscriptionIsActive || trialIsActive;

  // 3. Stop access before querying menu items
  if (!hasMenuAccess) {
    return (
      <div>
        <TrialBanner
          planStatus={vendor.plan_status ?? "inactive"}
          trialEndsAt={vendor.trial_ends_at ?? null}
        />

        <div className="mt-6 rounded-2xl bg-white p-8 shadow-sm text-center">
          <h2 className="text-lg font-bold text-gray-900">
            Menu management unavailable
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Your subscription is currently inactive. Activate a plan to add or
            manage menu items.
          </p>
        </div>
      </div>
    );
  }

  // 4. Only load menu items when vendor has access
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
      <TrialBanner
        planStatus={vendor.plan_status ?? "inactive"}
        trialEndsAt={vendor.trial_ends_at ?? null}
      />

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&rsquo;t load menu items: {error.message}
        </div>
      )}

      <MenuManager
        vendorId={user.id}
        initialDishes={(dishes as Dish[]) ?? []}
        planStatus={vendor.plan_status}
        trialEndsAt={vendor.trial_ends_at}
      />

      {dishes && dishes.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
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
