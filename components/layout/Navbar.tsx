"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight, LogIn } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { name: "How it works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
  { name: "For Vendors", href: "#vendors" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Image
              src="/images/logo.png"
              alt="BukaOnline Logo"
              width={80}
              height={50}
              className="h-auto w-[65px] sm:w-[80px]"
            />

            <span className="hidden text-2xl font-bold text-green-600 md:block">
              BukaOnline
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 font-medium text-gray-600 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="transition hover:text-green-600"
              >
                {link.name}
              </Link>
            ))}

            <Link href="/login" className="transition hover:text-green-600">
              Login
            </Link>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <Link
              href="/register"
              onClick={closeMenu}
              className="rounded-full bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-green-700 sm:px-6 sm:text-base"
            >
              Get Started
            </Link>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-800 transition hover:bg-gray-100 md:hidden"
            >
              <Menu size={23} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-in Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={closeMenu}
              className="fixed inset-0 z-[60] bg-black/40 md:hidden"
            />

            {/* Sliding Panel */}
            <motion.aside
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="fixed right-0 top-0 z-[70] flex h-screen w-[85%] max-w-[350px] flex-col bg-white p-6 shadow-2xl md:hidden"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <span className="text-xl font-bold text-gray-900">Menu</span>

                <button
                  type="button"
                  onClick={closeMenu}
                  aria-label="Close navigation menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="mt-8 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={closeMenu}
                    className="rounded-xl px-4 py-4 font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-600"
                  >
                    {link.name}
                  </Link>
                ))}

                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-xl px-4 py-4 font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-600"
                >
                  <LogIn size={19} />
                  Login
                </Link>
              </div>

              {/* Bottom CTA */}
              <div className="mt-auto border-t border-gray-100 pt-6">
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-green-600 py-4 font-semibold text-white shadow-lg transition hover:bg-green-700"
                >
                  Create an Account
                  <ArrowRight size={18} />
                </Link>

                <p className="mt-4 text-center text-xs text-gray-400">
                  © {new Date().getFullYear()} BukaOnline
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
