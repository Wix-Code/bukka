"use client";

import { useMemo, useState } from "react";
import FoodCard from "@/components/reusuable/FoodCard";
import { vendors } from "@/components/vendor/MockData";
import VendorHeader from "@/components/vendor/VendorHeader";

export default function VendorPage() {
  const vendor = vendors["mama-grace-kitchen"];
  const [query, setQuery] = useState("");

  const menu = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vendor.menu;
    return vendor.menu.filter(
      (food) =>
        food.name.toLowerCase().includes(q) ||
        food.description.toLowerCase().includes(q),
    );
  }, [query, vendor.menu]);

  return (
    <main className="bg-[#fffdf7] min-h-screen">
      <VendorHeader vendor={vendor} />

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Today&rsquo;s Menu
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {vendor.menu.length} item{vendor.menu.length === 1 ? "" : "s"}
            </p>
          </div>

          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
            Open Now
          </span>
        </div>

        <div className="relative max-w-sm mb-10">
          <SearchIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the menu"
            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 bg-white text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition"
          />
        </div>

        {menu.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {menu.map((food, index) => (
              <FoodCard key={index} food={food} phone={vendor.phone} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">
              No dishes match &ldquo;{query}&rdquo;.
            </p>
          </div>
        )}
      </section>

      <footer className="text-center pb-10">
        <p className="text-xs text-gray-400">Powered by Bukka</p>
      </footer>
    </main>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
