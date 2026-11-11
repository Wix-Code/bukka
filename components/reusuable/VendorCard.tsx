import Link from "next/link";
import { ArrowUpRight, MapPin, UtensilsCrossed } from "lucide-react";
import { Vendor } from "@/lib/vendors";

/* ------------------------------------------------------------------
   The one vendor card, used on /vendors and on the landing page.
   Change it here and both pages follow.
------------------------------------------------------------------- */

const AVATAR_GRADIENTS = [
  "from-orange-400 to-rose-500",
  "from-emerald-400 to-green-600",
  "from-amber-300 to-orange-500",
  "from-lime-400 to-emerald-600",
  "from-rose-400 to-pink-600",
  "from-teal-400 to-cyan-600",
];

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function formatNaira(value: number) {
  return nairaFormatter.format(value);
}

function hashString(value: string) {
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  return hash;
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "V";
}

export default function VendorCard({
  vendor,
  index,
  isNew,
}: {
  vendor: Vendor;
  index: number;
  isNew: boolean;
}) {
  const gradient =
    AVATAR_GRADIENTS[hashString(vendor.name) % AVATAR_GRADIENTS.length];

  const { stats } = vendor;

  return (
    <Link
      href={`/vendor/${vendor.slug}`}
      className="animate-fade-up group flex flex-col rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl hover:shadow-green-900/5"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div className="flex items-start gap-4">
        <div
          className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} text-lg font-bold text-white shadow-inner`}
        >
          {initialsOf(vendor.name)}

          {vendor.cover_image && (
            // Sits on top of the initials, so a broken URL falls back to them.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vendor.cover_image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-stone-900">
              {vendor.name}
            </h3>

            {isNew && (
              <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                New
              </span>
            )}
          </div>

          <p className="mt-1 flex items-center gap-1 text-sm text-stone-500">
            <MapPin size={14} className="shrink-0 text-stone-400" />
            <span className="truncate">
              {vendor.location?.trim() || "Location not set"}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-5 flex-1 rounded-2xl bg-stone-50 p-4">
        {stats ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
              Average dish price
            </p>

            <p className="mt-1 text-2xl font-bold text-stone-900">
              {formatNaira(stats.avg)}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-green-50 px-2.5 py-1 font-medium text-green-700">
                {stats.min === stats.max
                  ? formatNaira(stats.min)
                  : `${formatNaira(stats.min)} to ${formatNaira(stats.max)}`}
              </span>

              <span className="text-stone-400">
                {stats.count} {stats.count === 1 ? "dish" : "dishes"}
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full min-h-[84px] flex-col items-center justify-center gap-1.5 text-stone-400">
            <UtensilsCrossed size={20} />
            <p className="text-xs">Menu coming soon</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
        <span className="text-sm font-semibold text-green-700">View menu</span>

        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-700 transition group-hover:bg-green-600 group-hover:text-white">
          <ArrowUpRight size={16} />
        </span>
      </div>
    </Link>
  );
}
