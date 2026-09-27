import Sidebar from "@/components/dashboard/SideBar";
import Topbar from "@/components/dashboard/TopBar";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-[#fffdf7] min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
