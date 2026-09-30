"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileNav from "./MobileNav";
import { navItems } from "./NavItem";
import NotificationBell from "./notifications/NotificationBell";

type Props = {
  vendorName: string;
  avatarUrl: string | null;
  vendorId: string;
};

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "?";
}

export default function Topbar({ vendorName, avatarUrl, vendorId }: Props) {
  const pathname = usePathname();
  const current = navItems.find((item) => item.href === pathname);

  console.log(vendorName, "vendor name")

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
          <NotificationBell vendorId={vendorId} />

          <Link
            href="/dashboard/settings"
            aria-label="Account settings"
            className="w-9 h-9 rounded-full overflow-hidden bg-green-600 text-white flex items-center justify-center text-sm font-bold hover:opacity-90 transition"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(vendorName)
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
