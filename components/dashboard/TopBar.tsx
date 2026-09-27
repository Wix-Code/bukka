"use client";

import { usePathname } from "next/navigation";
import { Notification } from "iconsax-react";
import MobileNav from "./MobileNav";
import { navItems } from "./NavItem";

export default function Topbar() {
  const pathname = usePathname();
  const current = navItems.find((item) => item.href === pathname);

  return (
    <header className="sticky top-0 z-10 bg-[#fffdf7]/80 backdrop-blur border-b border-gray-100">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <MobileNav />
          <h1 className="text-lg font-bold text-gray-900">
            {current?.label ?? "Dashboard"}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            aria-label="Notifications"
            className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition"
          >
            <Notification size={20} color="currentColor" variant="Linear" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-600" />
          </button>

          <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
            M
          </div>
        </div>
      </div>
    </header>
  );
}
