import AdminSidebar from "@/components/admin-dashboard/layout/AdminSideBar";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex bg-[#fffdf7] min-h-screen">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-6">
        {children}
      </main>
    </div>
  );
}
