import Sidebar from "@/components/dashboard/SideBar";
import Topbar from "@/components/dashboard/TopBar";
import { createSupabaseServerClient } from "@/lib/server";
import { getVendorBySlug } from "@/lib/vendors";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log(user, "user")
  if (!user) redirect("/login");


  const vendorNames = user.user_metadata?.restaurant_name;


  const { data: vendor } = await supabase
    .from("vendors")
    .select("name, avatar_url")
    .eq("id", user.id)
    .single();

    console.log(vendor, "data")

  return (
    <div className="flex bg-[#fffdf7] min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Topbar
          vendorName={user.user_metadata?.restaurant_name ?? "Vendor"}
          avatarUrl={vendor?.avatar_url || null}
          vendorId={user.id}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
