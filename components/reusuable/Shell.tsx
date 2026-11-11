// components/layout/Shell.tsx
"use client";
import { usePathname } from "next/navigation";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

const HIDE_ON = ["/login", "/register", "/menu", "/forgot-password", "/menu"];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hide = HIDE_ON.some((p) => pathname.startsWith(p));

  return (
    <>
      {!hide && <Navbar />}
      {children}
      {!hide && <Footer />}
    </>
  );
}
