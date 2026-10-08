import { redirect } from "next/navigation";
import Link from "next/link";

import MenuManager from "@/components/dashboard/menu/MenuManager";
import type { Dish } from "@/components/dashboard/menu/DishFormDialog";
import Pagination from "@/components/reusuable/PaginationProps";
import TrialBanner from "@/components/reusuable/TrialBanner";

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

  if (!user) {
    redirect("/login");
  }

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select(
      `
      id,
      plan_status,
      trial_ends_at,
      subscription_ends_at,
      billing_period
    `,
    )
    .eq("id", user.id)
    .single();

  /*
   * During development, SHOW the actual Supabase error.
   * Do not silently redirect.
   */
  if (vendorError) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-red-700">
        <p className="font-semibold">
          Could not load subscription information.
        </p>

        <p className="mt-2 text-sm">{vendorError.message}</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-red-700">
        Vendor record could not be found.
      </div>
    );
  }

  const now = new Date();

  const trialEndsAt = vendor.trial_ends_at
    ? new Date(vendor.trial_ends_at)
    : null;

  const subscriptionEndsAt = vendor.subscription_ends_at
    ? new Date(vendor.subscription_ends_at)
    : null;

  // Trial is active whenever trial_ends_at is still in the future
  const trialIsActive =
    trialEndsAt !== null &&
    trialEndsAt > now &&
    vendor.plan_status !== "cancelled";

  // Paid subscription
  const subscriptionIsActive =
    vendor.plan_status === "active" &&
    (subscriptionEndsAt === null || subscriptionEndsAt > now);

  const hasMenuAccess = trialIsActive || subscriptionIsActive;

  /*
   * No trial/subscription access
   */
  if (!hasMenuAccess) {
    return (
      <div>
        <TrialBanner
          planStatus={vendor.plan_status ?? "inactive"}
          trialEndsAt={vendor.trial_ends_at ?? null}
        />

        <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto max-w-md">
            <h2 className="text-xl font-bold text-gray-900">
              Your subscription has expired
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Renew your Bukka subscription to continue creating and managing
              your menu.
            </p>

            <Link
              href="/dashboard/billing"
              className="mt-6 inline-flex rounded-full bg-green-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              Renew subscription
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
    .order("created_at", {
      ascending: false,
    })
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
