"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FoodCard from "@/components/reusuable/FoodCard";
import SelectDropdown from "@/components/reusuable/SelectDropdown";
import EmptyState from "./EmptyState";
import { Dropbox } from "iconsax-react";
import { Dish } from "../dashboard/menu/DishFormDialog";

type Category = {
  id: string;
  name: string;
};

type DaySchedule = {
  day: string;
  isOpen: boolean;
  open: string;
  close: string;
};

type WeeklySchedule = {
  format?: string;
  days: DaySchedule[];
};

type BusinessStatus = {
  isOpen: boolean | null;
  label: string;
  detail: string;
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

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const HOURS_REGEX =
  /(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*(?:-|–|—|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i;

// Convert a 24-hour time string (08:30) into minutes.
function parseTime(time: string): number | null {
  if (!time) return null;

  const match = time.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour > 23 || minute > 59) return null;

  return hour * 60 + minute;
}

// Convert minutes into a readable 12-hour time.
function formatTime(time: string): string {
  const minutes = parseTime(time);

  if (minutes === null) return time;

  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}

// Get the current time in Nigeria.
function getMinutesNow(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value) % 24;

  const minute = Number(parts.find((part) => part.type === "minute")?.value);

  return hour * 60 + minute;
}

// Get today's weekday in Nigeria.
function getToday(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "long",
  }).format(date);
}

function getPreviousDay(day: string): string {
  const index = DAYS.indexOf(day);

  if (index === -1) return "";

  return DAYS[(index + 6) % 7];
}

// Parse the weekly opening hours stored in Supabase.
function parseWeeklySchedule(workingHours: string): WeeklySchedule | null {
  try {
    const parsed = JSON.parse(workingHours);

    if (!parsed || !Array.isArray(parsed.days)) {
      return null;
    }

    return parsed as WeeklySchedule;
  } catch {
    return null;
  }
}

// Check whether a business is open based on a particular day's schedule.
function isOpenAt(schedule: DaySchedule, currentMinutes: number): boolean {
  if (!schedule.isOpen) return false;

  const open = parseTime(schedule.open);
  const close = parseTime(schedule.close);

  if (open === null || close === null) return false;

  // Same opening and closing time means open 24 hours.
  if (open === close) return true;

  // Normal opening hours, e.g. 08:00 - 22:00.
  if (open < close) {
    return currentMinutes >= open && currentMinutes < close;
  }

  // Overnight hours, e.g. 18:00 - 02:00.
  return currentMinutes >= open;
}

// Calculate the current business status.
function getBusinessStatus(
  workingHours: string | undefined,
  now: Date,
): BusinessStatus {
  if (!workingHours) {
    return {
      isOpen: null,
      label: "Hours not set",
      detail: "Opening hours are not available.",
    };
  }

  const currentMinutes = getMinutesNow(now);
  const today = getToday(now);

  // First, check the new weekly JSON format.
  const weeklySchedule = parseWeeklySchedule(workingHours);

  if (weeklySchedule) {
    const todaySchedule = weeklySchedule.days.find(
      (item) => item.day.toLowerCase() === today.toLowerCase(),
    );

    if (!todaySchedule) {
      return {
        isOpen: null,
        label: "Hours unavailable",
        detail: "Today's opening hours could not be determined.",
      };
    }

    const previousDay = getPreviousDay(today);

    const previousSchedule = weeklySchedule.days.find(
      (item) => item.day.toLowerCase() === previousDay.toLowerCase(),
    );

    // Check whether yesterday's overnight schedule is still active.
    if (
      previousSchedule?.isOpen &&
      previousSchedule.open &&
      previousSchedule.close
    ) {
      const previousOpen = parseTime(previousSchedule.open);
      const previousClose = parseTime(previousSchedule.close);

      if (
        previousOpen !== null &&
        previousClose !== null &&
        previousOpen > previousClose &&
        currentMinutes < previousClose
      ) {
        return {
          isOpen: true,
          label: "Open Now",
          detail: `Closes today at ${formatTime(previousSchedule.close)}.`,
        };
      }
    }

    // Check today's schedule.
    if (todaySchedule.isOpen) {
      const open = parseTime(todaySchedule.open);
      const close = parseTime(todaySchedule.close);

      if (open === null || close === null) {
        return {
          isOpen: null,
          label: "Hours unavailable",
          detail: "Today's opening hours are invalid.",
        };
      }

      if (isOpenAt(todaySchedule, currentMinutes)) {
        return {
          isOpen: true,
          label: "Open Now",
          detail: `Closes at ${formatTime(todaySchedule.close)}.`,
        };
      }

      if (currentMinutes < open) {
        return {
          isOpen: false,
          label: "Closed Now",
          detail: `Opens today at ${formatTime(todaySchedule.open)}.`,
        };
      }
    }

    return {
      isOpen: false,
      label: "Closed Now",
      detail: todaySchedule.isOpen
        ? `Today's hours: ${formatTime(todaySchedule.open)} – ${formatTime(todaySchedule.close)}.`
        : "Closed today.",
    };
  }

  // Backward compatibility for old values such as:
  // "8:00 AM - 10:00 PM"
  const match = workingHours.match(HOURS_REGEX);

  if (!match) {
    return {
      isOpen: null,
      label: "Hours unavailable",
      detail: "Please update your restaurant opening hours.",
    };
  }

  const [, startHour, startMinute, startPeriod, endHour, endMinute, endPeriod] =
    match;

  function convertToMinutes(
    hour: string,
    minute: string | undefined,
    period: string,
  ) {
    let h = Number(hour) % 12;

    if (period.toLowerCase() === "pm") {
      h += 12;
    }

    return h * 60 + Number(minute || 0);
  }

  const start = convertToMinutes(startHour, startMinute, startPeriod);

  const end = convertToMinutes(endHour, endMinute, endPeriod);

  const open =
    start === end
      ? true
      : start < end
        ? currentMinutes >= start && currentMinutes < end
        : currentMinutes >= start || currentMinutes < end;

  if (open) {
    return {
      isOpen: true,
      label: "Open Now",
      detail: "We are currently accepting customers.",
    };
  }

  return {
    isOpen: false,
    label: "Closed Now",
    detail: `Today's hours: ${workingHours}.`,
  };
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

  // Update the current time every minute.
  useEffect(() => {
    setCurrentTime(new Date());

    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  const businessStatus = useMemo(
    () => (currentTime ? getBusinessStatus(workingHours, currentTime) : null),
    [workingHours, currentTime],
  );

  // Category options.
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

  // Update URL when category changes.
  function handleCategoryChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }

    params.delete("page");

    setQuery("");

    const queryString = params.toString();

    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  // Search within dishes on the current page.
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
    <section className="mx-auto max-w-7xl px-6 py-12">
      {/* Heading */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Today&rsquo;s Menu
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {totalItems} item{totalItems === 1 ? "" : "s"}
          </p>
        </div>

        {/* Live opening status */}
        {businessStatus && (
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                businessStatus.isOpen === true
                  ? "bg-green-100 text-green-700"
                  : businessStatus.isOpen === false
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  businessStatus.isOpen === true
                    ? "bg-green-600"
                    : businessStatus.isOpen === false
                      ? "bg-red-500"
                      : "bg-gray-400"
                }`}
              />

              {businessStatus.label}
            </span>

            <p className="text-xs text-gray-500">{businessStatus.detail}</p>
          </div>
        )}
      </div>

      {/* Search and Category Filter */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-2xl">
        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the menu"
            className="w-full rounded-full border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        {/* Category Dropdown */}
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
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="py-20 text-center">
          <div className="rounded-3xl bg-white">
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
