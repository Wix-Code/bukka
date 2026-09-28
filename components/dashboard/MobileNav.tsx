"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HambergerMenu } from "iconsax-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navItems } from "./NavItem";
import LogoutButton from "./LogoutBtn";

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <button
          aria-label="Open menu"
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
        >
          <HambergerMenu size={22} color="currentColor" />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 p-6 flex flex-col">
        <SheetHeader className="p-0">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        </SheetHeader>

        <Link
          href="/dashboard"
          onClick={() => setOpen(false)}
          className="block font-bold text-xl text-gray-900 mb-10"
        >
          Bukka
        </Link>
        <Link
          href="/dashboard"
          onClick={() => setOpen(false)}
          className="block font-bold text-xl text-gray-900 mb-10"
        >
          <img className="w-[50px] object-cover" src="/images/logo.png" />
          Bukka
        </Link>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
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

        <div className="border-t border-gray-100 pt-4">
          <LogoutButton />
        </div>
      </SheetContent>
    </Sheet>
  );
}
