"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpDown,
  MapPin,
  Search,
  X,
  Utensils,
  Globe,
  Map,
  Building2,
  LocateFixed,
} from "lucide-react";
import SelectDropdown from "./SelectDropdown";

type FilterOption = {
  name: string;
  count: number;
};

type State = {
  q: string;
  country: string;
  state: string;
  lga: string;
  city: string;
  sort: string;
  under: number | null;
  dineIn: string;
};

type Props = {
  initial: State;
  defaultSort: string;
  countries: FilterOption[];
  states: FilterOption[];
  lgas: FilterOption[];
  cities: FilterOption[];
  sortOptions: { value: string; label: string }[];
  budgetOptions: number[];
};

export default function VendorsToolbar({
  initial,
  defaultSort,
  countries,
  states,
  lgas,
  cities,
  sortOptions,
  budgetOptions,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
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
    if (next.country) params.set("country", next.country);
    if (next.state) params.set("state", next.state);
    if (next.lga) params.set("lga", next.lga);
    if (next.city) params.set("city", next.city);

    if (next.sort !== defaultSort) {
      params.set("sort", next.sort);
    }

    if (next.under !== null) {
      params.set("under", String(next.under));
    }

    if (next.dineIn !== "all") {
      params.set("dine_in", next.dineIn === "yes" ? "true" : "false");
    }

    const query = params.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
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
    state.country !== "" ||
    state.state !== "" ||
    state.lga !== "" ||
    state.city !== "" ||
    state.under !== null ||
    state.sort !== defaultSort ||
    state.dineIn !== "all";

  function clearAll() {
    update({
      q: "",
      country: "",
      state: "",
      lga: "",
      city: "",
      sort: defaultSort,
      under: null,
      dineIn: "all",
    });
  }

  const countryOptions = [
    { label: "All countries", value: "" },
    ...countries.map((item) => ({
      label: `${item.name} (${item.count})`,
      value: item.name,
    })),
  ];

  const stateOptions = [
    { label: "All states", value: "" },
    ...states.map((item) => ({
      label: `${item.name} (${item.count})`,
      value: item.name,
    })),
  ];

  const lgaOptions = [
    { label: "All LGAs", value: "" },
    ...lgas.map((item) => ({
      label: `${item.name} (${item.count})`,
      value: item.name,
    })),
  ];

  const cityOptions = [
    { label: "All cities", value: "" },
    ...cities.map((item) => ({
      label: `${item.name} (${item.count})`,
      value: item.name,
    })),
  ];

  const dineInOptions = [
    { label: "All vendors", value: "all" },
    { label: "Dine-in available", value: "yes" },
    { label: "No dine-in", value: "no" },
  ];

  return (
    <div className="relative rounded-3xl bg-white p-3 shadow-xl shadow-green-950/10 ring-1 ring-black/5 sm:p-4">
      <div
        aria-hidden
        className={`absolute inset-x-6 top-0 h-0.5 rounded-full bg-green-500 transition-opacity ${
          isPending ? "animate-pulse opacity-100" : "opacity-0"
        }`}
      />

      <div className="flex flex-col gap-3">
        {/* SEARCH */}
        <label className="relative block">
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

        {/* LOCATION FILTERS */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SelectDropdown
            noMargin
            triggerClassName="h-12 py-0"
            ariaLabel="Filter by country"
            icon={<Globe size={18} />}
            options={countryOptions}
            value={state.country}
            onChange={(value) =>
              update({
                country: value,
                state: "",
                lga: "",
                city: "",
              })
            }
          />

          <SelectDropdown
            noMargin
            triggerClassName="h-12 py-0"
            ariaLabel="Filter by state"
            icon={<Map size={18} />}
            options={stateOptions}
            value={state.state}
            onChange={(value) =>
              update({
                state: value,
                lga: "",
                city: "",
              })
            }
          />

          <SelectDropdown
            noMargin
            triggerClassName="h-12 py-0"
            ariaLabel="Filter by LGA"
            icon={<Building2 size={18} />}
            options={lgaOptions}
            value={state.lga}
            onChange={(value) =>
              update({
                lga: value,
                city: "",
              })
            }
          />

          <SelectDropdown
            noMargin
            triggerClassName="h-12 py-0"
            ariaLabel="Filter by city"
            icon={<LocateFixed size={18} />}
            options={cityOptions}
            value={state.city}
            onChange={(value) => update({ city: value })}
          />

          <SelectDropdown
            noMargin
            triggerClassName="h-12 py-0"
            ariaLabel="Filter by dine-in availability"
            icon={<Utensils size={18} />}
            options={dineInOptions}
            value={state.dineIn}
            onChange={(value) => update({ dineIn: value })}
          />

          <SelectDropdown
            noMargin
            triggerClassName="h-12 py-0"
            ariaLabel="Sort vendors"
            icon={<ArrowUpDown size={18} />}
            options={sortOptions}
            value={state.sort}
            onChange={(value) => update({ sort: value })}
          />
        </div>

        {/* OTHER FILTERS */}
        {/* <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SelectDropdown
            noMargin
            triggerClassName="h-12 py-0"
            ariaLabel="Filter by dine-in availability"
            icon={<Utensils size={18} />}
            options={dineInOptions}
            value={state.dineIn}
            onChange={(value) => update({ dineIn: value })}
          />

          <SelectDropdown
            noMargin
            triggerClassName="h-12 py-0"
            ariaLabel="Sort vendors"
            icon={<ArrowUpDown size={18} />}
            options={sortOptions}
            value={state.sort}
            onChange={(value) => update({ sort: value })}
          />
        </div> */}
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
