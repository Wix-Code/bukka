import { redirect } from "next/navigation";
import MenuManager from "@/components/dashboard/menu/MenuManager";
import type { Dish } from "@/components/dashboard/menu/DishFormDialog";
import { createSupabaseServerClient } from "@/lib/server";

export default async function MenuPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware should already have redirected an unauthenticated request,
  // but this covers direct hits during local dev or a race on session expiry.
  if (!user) redirect("/login");

  const { data: dishes } = await supabase
    .from("menu_items")
    .select("*")
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <MenuManager vendorId={user.id} initialDishes={(dishes as Dish[]) ?? []} />
  );
}
