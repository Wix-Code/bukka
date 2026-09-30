import { redirect } from "next/navigation";
import { Notification } from "iconsax-react";
import EmptyState from "@/components/reusuable/EmptyState";
import { createSupabaseServerClient } from "@/lib/server";
import Pagination from "@/components/reusuable/PaginationProps";


const PAGE_SIZE = 10;

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

export default async function NotificationsPage({
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

  if (!user) redirect("/login");

  const [{ data: orders, count, error }, { data: vendor }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, item_name, item_price, status, created_at", {
        count: "exact",
      })
      .eq("vendor_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase
      .from("vendors")
      .select("notifications_last_seen_at")
      .eq("id", user.id)
      .single(),
  ]);

  const lastSeenAt = vendor?.notifications_last_seen_at ?? null;

  // Viewing this page counts as reading everything on it — mark seen now,
  // after computing unread state above from the *previous* seen time.
  await supabase
    .from("vendors")
    .update({ notifications_last_seen_at: new Date().toISOString() })
    .eq("id", user.id);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Notifications</h1>
      <p className="text-sm text-gray-500 mb-8">Every order as it comes in.</p>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">
          Couldn&rsquo;t load notifications: {error.message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {!orders || orders.length === 0 ? (
          <EmptyState
            icon={
              <Notification size={24} color="currentColor" variant="Bold" />
            }
            title={
              error ? "Couldn't load notifications" : "No notifications yet"
            }
            description={
              error
                ? "See the error above for details."
                : "You'll see every order here the moment a customer places one."
            }
          />
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {orders.map((order) => {
                const isUnread = lastSeenAt
                  ? new Date(order.created_at) > new Date(lastSeenAt)
                  : true;
                return (
                  <div
                    key={order.id}
                    className={`px-6 py-4 flex items-start justify-between gap-4 ${
                      isUnread ? "bg-green-50/40" : ""
                    }`}
                  >
                    <div>
                      <p className="text-sm text-gray-900 font-medium">
                        New order: {order.item_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        ₦{Number(order.item_price).toLocaleString()} ·{" "}
                        {timeAgo(order.created_at)}
                      </p>
                    </div>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-green-600 mt-1.5 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              createPageHref={(page) => `/dashboard/notifications?page=${page}`}
            />
          </>
        )}
      </div>
    </div>
  );
}
