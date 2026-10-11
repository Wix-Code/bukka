"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FoodCard from "@/components/reusuable/FoodCard";
import SelectDropdown from "@/components/reusuable/SelectDropdown";
import type { Dish } from "@/lib/vendors";
import EmptyState from "./EmptyState";
import { Dropbox } from "iconsax-react";

type Category = {
  id: string;
  name: string;
};

type Props = {
  dishes: Dish[];
  phone: string;
  vendorId: string;
  workingHours?: string;
  categories: Category[];
  selectedCategory: string;
  totalItems: number;
};

const TIMEZONE = "Africa/Lagos";

// Minutes since midnight in the vendor's timezone
function getMinutesNow(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((p) => p.type === "hour")?.value) % 24;

  const minute = Number(parts.find((p) => p.type === "minute")?.value);

  return hour * 60 + minute;
}

function toMinutes(hour: string, minute: string | undefined, period: string) {
  let h = Number(hour) % 12;

  if (period.toLowerCase() === "pm") {
    h += 12;
  }

  return h * 60 + Number(minute || 0);
}

const HOURS_REGEX =
  /(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*(?:-|–|—|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i;

function checkIsOpen(workingHours: string | undefined, now: Date): boolean {
  if (!workingHours) return false;

  const match = workingHours.match(HOURS_REGEX);

  if (!match) return false;

  const [, sh, sm, sp, eh, em, ep] = match;

  const start = toMinutes(sh, sm, sp);
  const end = toMinutes(eh, em, ep);
  const current = getMinutesNow(now);

  if (start < end) {
    return current >= start && current < end;
  }

  return current >= start || current < end;
}

export default function MenuSection({
  workingHours,
  dishes,
  phone,
  vendorId,
  categories,
  selectedCategory,
  totalItems,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");

  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());

    const timer = setInterval(() => setCurrentTime(new Date()), 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  const isOpen = useMemo(
    () => (currentTime ? checkIsOpen(workingHours, currentTime) : false),
    [workingHours, currentTime],
  );

  // Category options
  const categoryOptions = useMemo(
    () => [
      {
        label: "All Categories",
        value: "",
      },
      ...categories.map((category) => ({
        label: category.name,
        value: category.id,
      })),
    ],
    [categories],
  );

  // Update URL when category changes
  function handleCategoryChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }

    // Start from page 1 whenever category changes
    params.delete("page");

    setQuery("");

    const queryString = params.toString();

    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  // Search within dishes on the current page
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return dishes;

    return dishes.filter(
      (food) =>
        (food.name ?? "").toLowerCase().includes(q) ||
        (food.description ?? "").toLowerCase().includes(q),
    );
  }, [query, dishes]);

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      {/* Heading */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Today&rsquo;s Menu
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {totalItems} item
            {totalItems === 1 ? "" : "s"}
          </p>
        </div>

        {currentTime && (
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              isOpen
                ? "bg-green-100 text-green-700 animate-pulse"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isOpen ? "Open Now" : "Closed"}
          </span>
        )}
      </div>

      {/* Search and Category Filter */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-2xl">
        {/* Search */}
        <div className="relative">
          <SearchIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the menu"
            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 bg-white text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition"
          />
        </div>

        {/* Reusable Category Dropdown */}
        <SelectDropdown
          placeholder="All Categories"
          options={categoryOptions}
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="!mb-0"
        />
      </div>

      {/* Dishes */}
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
          <div className="bg-white rounded-3xl">
            <EmptyState
              icon={<Dropbox size={28} color="#16A34A" />}
              title={
                query.trim()
                  ? `No dishes match "${query}"`
                  : selectedCategory
                    ? "No dishes in this category"
                    : "No dishes available"
              }
              description={
                query.trim()
                  ? "No dishes on this page match your search."
                  : selectedCategory
                    ? "There are currently no dishes in this category."
                    : "The menu doesn't have any dishes yet."
              }
            />
          </div>
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
