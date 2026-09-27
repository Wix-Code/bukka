import AdminSidebar from "@/components/admin-dashboard/layout/AdminSideBar";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex bg-gray-950 min-h-screen">
      <AdminSidebar />
      <main className="p-6 flex-1">
        {children}
      </main>
    </div>
  );
}
