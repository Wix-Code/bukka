"use client";

import { useMemo, useState } from "react";
import FoodCard from "@/components/reusuable/FoodCard";
import type { Dish } from "@/lib/vendors";

type Props = {
  dishes: Dish[];
  phone: string;
  vendorId: string;
};

export default function MenuSection({ dishes, phone, vendorId }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return dishes;
    return dishes.filter(
      (food) =>
        food.name.toLowerCase().includes(q) ||
        food.description.toLowerCase().includes(q),
    );
  }, [query, dishes]);

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Today&rsquo;s Menu
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {dishes.length} item{dishes.length === 1 ? "" : "s"}
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

      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              phone={phone}
              vendorId={vendorId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500">
            {dishes.length === 0
              ? "This menu doesn't have any dishes yet."
              : `No dishes match "${query}".`}
          </p>
        </div>
      )}
    </section>
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
