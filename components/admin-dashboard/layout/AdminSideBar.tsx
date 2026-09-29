"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home2, Shop, Bag2, HambergerMenu, CloseSquare } from "iconsax-react";
import LogoutButton from "./LogoutButton";

const navItems = [
  { label: "Overview", href: "/admin-dashboard", icon: Home2 },
  { label: "Vendors", href: "/admin-dashboard/vendors", icon: Shop },
  { label: "Orders", href: "/admin-dashboard/orders", icon: Bag2 },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col justify-between px-5 py-8">
      <div>
        <Link
          href="/admin-dashboard"
          onClick={onNavigate}
          className="block font-bold text-xl text-gray-900 px-2 mb-10"
        >
          <img className="w-[80px]" src="/images/logo.png" alt="Bukka logo" />
          Bukka <span className="text-gray-400 font-normal">Admin</span>
        </Link>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  active
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  size={20}
                  color="currentColor"
                  variant={active ? "Bold" : "Linear"}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <LogoutButton redirectTo="/admin/login" />
    </div>
  );
}

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape, and lock body scroll while the drawer is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Desktop sidebar (unchanged look) */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-gray-100 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile top bar with hamburger */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-700 hover:bg-gray-50 active:scale-95 transition"
        >
          <HambergerMenu size={24} color="currentColor" />
        </button>

        <Link href="/admin-dashboard" className="flex items-center gap-2">
          <img className="h-8 w-auto" src="/images/logo.png" alt="Bukka logo" />
          <span className="font-bold text-gray-900">
            Bukka <span className="text-gray-400 font-normal">Admin</span>
          </span>
        </Link>

        {/* Spacer keeps the logo centered */}
        <div className="w-10" />
      </header>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Panel */}
        <aside
          className={`absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 transition"
          >
            <CloseSquare size={22} color="currentColor" />
          </button>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </aside>
      </div>
    </>
  );
}
