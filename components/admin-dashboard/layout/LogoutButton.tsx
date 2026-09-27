"use client";

import { useRouter } from "next/navigation";
import { LogoutCurve } from "iconsax-react";
import { supabase } from "@/lib/supabase";

export default function LogoutButton({
  className = "",
  redirectTo = "/login",
}: {
  className?: string;
  redirectTo?: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push(redirectTo);
  }

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-red-600 transition w-full ${className}`}
    >
      <LogoutCurve size={20} color="currentColor" variant="Linear" />
      Log out
    </button>
  );
}
