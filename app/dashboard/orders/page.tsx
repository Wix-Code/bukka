import { redirect } from "next/navigation";
import OrdersManager, {
  type Order,
} from "@/components/dashboard/order/OrdersManager";
import { createSupabaseServerClient } from "@/lib/server";

export default async function OrdersPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false });

  return <OrdersManager initialOrders={(orders as Order[]) ?? []} />;
}
