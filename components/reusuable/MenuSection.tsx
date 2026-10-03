// "use client";

// import { useMemo, useState } from "react";
// import FoodCard from "@/components/reusuable/FoodCard";
// import type { Dish } from "@/lib/vendors";
// import EmptyState from "./EmptyState";
// import { Dropbox } from "iconsax-react";

// type Props = {
//   dishes: Dish[];
//   phone: string;
//   vendorId: string;
//   workingHours?: string;
// };

// export default function MenuSection({ workingHours, dishes, phone, vendorId }: Props) {
//   const [query, setQuery] = useState("");

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return dishes;
//     return dishes.filter(
//       (food) =>
//         food.name.toLowerCase().includes(q) ||
//         food.description.toLowerCase().includes(q),
//     );
//   }, [query, dishes]);

//   console.log(dishes, "dishes")
//   console.log(workingHours, "working");

//   return (
//     <section className="max-w-7xl mx-auto px-6 py-12">
//       <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-900">
//             Today&rsquo;s Menu
//           </h2>
//           <p className="mt-1 text-sm text-gray-500">
//             {dishes.length} item{dishes.length === 1 ? "" : "s"}
//           </p>
//         </div>

//         <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
//           Open Now
//         </span>
//       </div>

//       <div className="relative max-w-sm mb-10">
//         <SearchIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
//         <input
//           type="text"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Search the menu"
//           className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 bg-white text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition"
//         />
//       </div>

//       {filtered.length > 0 ? (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
//           {filtered.map((food) => (
//             <FoodCard
//               key={food.id}
//               food={food}
//               phone={phone}
//               vendorId={vendorId}
//             />
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-20">
//           <p className="text-gray-500">
//             {dishes.length === 0 ? (
//               <div className="bg-white rounded-3xl">
//                 <EmptyState
//                   icon={<Dropbox size={28} color="#16A34A" />}
//                   title="No dishes available"
//                   description="The menu doesn't have any dishes yet."
//                 />
//               </div>
//             ) : (
//               <div className="bg-white rounded-3xl">
//                 <EmptyState
//                   icon={<Dropbox size={28} color="#16A34A" />}
//                   title={`No dishes match "${query}".`}
//                   description="The menu doesn't have any dishes base on what you filtered."
//                 />
//               </div>
//             )}
//           </p>
//         </div>
//       )}
//     </section>
//   );
// }

// function SearchIcon({ className }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       className={className}
//     >
//       <circle cx="11" cy="11" r="7" />
//       <path d="M21 21l-4.35-4.35" />
//     </svg>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import FoodCard from "@/components/reusuable/FoodCard";
import type { Dish } from "@/lib/vendors";
import EmptyState from "./EmptyState";
import { Dropbox } from "iconsax-react";

type Props = {
  dishes: Dish[];
  phone: string;
  vendorId: string;
  workingHours?: string;
};

const TIMEZONE = "Africa/Lagos";

// Minutes since midnight in the vendor's timezone (not the server/browser's)
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
  let h = Number(hour) % 12; // 12am -> 0, 12pm -> 0 (+12 below)
  if (period.toLowerCase() === "pm") h += 12;
  return h * 60 + Number(minute || 0);
}

// Accepts "9am - 9pm", "9:30 AM – 10:00 PM", "9am to 9pm"
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

  // Normal hours, e.g. 9am - 9pm
  if (start < end) return current >= start && current < end;

  // Overnight hours, e.g. 9pm - 2am
  return current >= start || current < end;
}

export default function MenuSection({
  workingHours,
  dishes,
  phone,
  vendorId,
}: Props) {
  const [query, setQuery] = useState("");
  // null on the server and first render, so server and client HTML match
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
      <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Today&rsquo;s Menu
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {dishes.length} item{dishes.length === 1 ? "" : "s"}
          </p>
        </div>

        {/* Render only after mount to avoid a wrong "Closed" flash */}
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
        // was <p><div/></p>, which is invalid nesting
        <div className="text-center py-20">
          <div className="bg-white rounded-3xl">
            <EmptyState
              icon={<Dropbox size={28} color="#16A34A" />}
              title={
                dishes.length === 0
                  ? "No dishes available"
                  : `No dishes match "${query}"`
              }
              description={
                dishes.length === 0
                  ? "The menu doesn't have any dishes yet."
                  : "No dishes on the menu match your search."
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
