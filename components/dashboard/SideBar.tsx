"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./NavItem";
import LogoutButton from "./LogoutBtn";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between bg-white border-r border-gray-100 h-screen sticky top-0 px-5 py-8">
      <div>
        <Link
          href="/dashboard"
          className="block font-bold text-xl text-gray-900 px-2 mb-10"
        >
          Bukka
        </Link>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
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

      <LogoutButton />
    </aside>
  );
}
