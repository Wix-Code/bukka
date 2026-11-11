"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, ChevronDown, MapPin, Search, X } from "lucide-react";

type State = {
  q: string;
  location: string;
  sort: string;
  under: number | null;
};

type Props = {
  basePath: string;
  initial: State;
  defaultSort: string;
  locations: { name: string; count: number }[];
  sortOptions: { value: string; label: string }[];
  budgetOptions: number[];
};

const selectClass =
  "h-12 w-full appearance-none rounded-2xl border border-stone-200 bg-white pl-11 pr-10 text-sm text-stone-800 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10";

export default function VendorsToolbar({
  basePath,
  initial,
  defaultSort,
  locations,
  sortOptions,
  budgetOptions,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [state, setState] = useState<State>(initial);
  const latest = useRef<State>(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function navigate(next: State) {
    const params = new URLSearchParams();

    if (next.q.trim()) params.set("q", next.q.trim());
    if (next.location) params.set("location", next.location);
    if (next.sort !== defaultSort) params.set("sort", next.sort);
    if (next.under !== null) params.set("under", String(next.under));

    const query = params.toString();

    startTransition(() => {
      router.replace(query ? `${basePath}?${query}` : basePath, {
        scroll: false,
      });
    });
  }

  function update(patch: Partial<State>, debounce = false) {
    const next = { ...latest.current, ...patch };

    latest.current = next;
    setState(next);

    if (timer.current) clearTimeout(timer.current);

    if (debounce) {
      timer.current = setTimeout(() => navigate(latest.current), 350);
    } else {
      navigate(next);
    }
  }

  const hasActive =
    state.q.trim() !== "" ||
    state.location !== "" ||
    state.under !== null ||
    state.sort !== defaultSort;

  function clearAll() {
    update({ q: "", location: "", sort: defaultSort, under: null });
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white p-3 shadow-xl shadow-green-950/10 ring-1 ring-black/5 sm:p-4">
      <div
        aria-hidden
        className={`absolute inset-x-0 top-0 h-0.5 bg-green-500 transition-opacity ${
          isPending ? "animate-pulse opacity-100" : "opacity-0"
        }`}
      />

      <div className="flex flex-col gap-3 lg:flex-row">
        {/* SEARCH */}
        <label className="relative block flex-1">
          <span className="sr-only">Search vendors or dishes</span>

          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
          />

          <input
            type="search"
            value={state.q}
            onChange={(event) => update({ q: event.target.value }, true)}
            placeholder="Search vendors, dishes or areas"
            className="h-12 w-full rounded-2xl border border-stone-200 bg-white pl-11 pr-11 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-green-600 focus:ring-4 focus:ring-green-600/10 [&::-webkit-search-cancel-button]:hidden"
          />

          {state.q && (
            <button
              type="button"
              onClick={() => update({ q: "" })}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition hover:bg-stone-200"
            >
              <X size={14} />
            </button>
          )}
        </label>

        {/* LOCATION */}
        <label className="relative block lg:w-60">
          <span className="sr-only">Filter by location</span>

          <MapPin
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
          />

          <select
            value={state.location}
            onChange={(event) => update({ location: event.target.value })}
            className={selectClass}
          >
            <option value="">All locations</option>
            {locations.map((location) => (
              <option key={location.name} value={location.name}>
                {location.name} ({location.count})
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400"
          />
        </label>

        {/* SORT */}
        <label className="relative block lg:w-56">
          <span className="sr-only">Sort vendors</span>

          <ArrowUpDown
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
          />

          <select
            value={state.sort}
            onChange={(event) => update({ sort: event.target.value })}
            className={selectClass}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400"
          />
        </label>
      </div>

      {/* BUDGET CHIPS */}
      {(budgetOptions.length > 0 || hasActive) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
          {budgetOptions.length > 0 && (
            <>
              <span className="mr-1 text-xs font-medium text-stone-500">
                Dishes under
              </span>

              {[null, ...budgetOptions].map((amount) => {
                const active = state.under === amount;

                return (
                  <button
                    key={amount ?? "any"}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update({ under: amount })}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                      active
                        ? "bg-green-600 text-white shadow-sm"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {amount === null
                      ? "Any price"
                      : `₦${amount.toLocaleString("en-NG")}`}
                  </button>
                );
              })}
            </>
          )}

          {hasActive && (
            <button
              type="button"
              onClick={clearAll}
              className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-stone-500 transition hover:text-green-700"
            >
              <X size={14} />
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
