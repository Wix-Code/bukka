"use client";

import { useEffect, useRef, useState } from "react";

import { Check, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type VendorStatus = "all" | "active" | "inactive" | "past_due" | "cancelled";

type Props = {
  initialSearch: string;
  initialStatus: VendorStatus;
};

const statusOptions: {
  label: string;
  value: VendorStatus;
}[] = [
  {
    label: "All statuses",
    value: "all",
  },
  {
    label: "Active",
    value: "active",
  },
  {
    label: "Inactive",
    value: "inactive",
  },
  {
    label: "Past due",
    value: "past_due",
  },
  {
    label: "Cancelled",
    value: "cancelled",
  },
];

export default function AdminVendorsToolbar({
  initialSearch,
  initialStatus,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialSearch);

  const [statusFilter, setStatusFilter] = useState<VendorStatus>(initialStatus);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /*
   * Keep local input synced when the
   * server URL changes via pagination,
   * back/forward navigation, etc.
   */
  useEffect(() => {
    setQuery(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setStatusFilter(initialStatus);
  }, [initialStatus]);

  const selectedStatus =
    statusOptions.find((option) => option.value === statusFilter) ??
    statusOptions[0];

  /*
   * Close dropdown outside / Escape
   */
  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);

      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /*
   * Search with debounce.
   *
   * Only update the URL when the
   * search is actually different
   * from the server value.
   */
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed === initialSearch) {
      return;
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      /*
       * Always restart pagination
       * when search changes.
       */
      params.delete("page");

      if (trimmed) {
        params.set("search", trimmed);
      } else {
        params.delete("search");
      }

      const queryString = params.toString();

      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [query, initialSearch, pathname, router, searchParams]);

  function changeStatus(value: VendorStatus) {
    setStatusFilter(value);
    setDropdownOpen(false);

    const params = new URLSearchParams(searchParams.toString());

    /*
     * Always restart on page 1
     * when filter changes.
     */
    params.delete("page");

    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }

    const queryString = params.toString();

    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* SEARCH */}
      <div className="relative w-full sm:max-w-sm">
        <Search
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search vendors"
          className="w-full rounded-full border border-gray-200 bg-white py-3 pl-11 pr-11 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-400 transition hover:text-gray-700"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* CUSTOM STATUS FILTER */}
      <div ref={dropdownRef} className="relative w-full sm:w-[220px]">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
          onClick={() => setDropdownOpen((previous) => !previous)}
          className={`flex w-full items-center justify-between rounded-full border bg-white py-3 pl-4 pr-4 text-sm transition-all duration-200 ${
            dropdownOpen
              ? "border-green-600 ring-2 ring-green-100"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <SlidersHorizontal size={17} className="shrink-0 text-gray-400" />

            <span className="flex min-w-0 items-center gap-2.5 text-gray-700">
              <StatusDot status={statusFilter} />

              <span className="truncate">{selectedStatus.label}</span>
            </span>
          </div>

          <ChevronDown
            size={17}
            className={`shrink-0 text-gray-400 transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* DROPDOWN */}
        {dropdownOpen && (
          <div
            role="listbox"
            className="absolute right-0 z-50 mt-2 w-full rounded-2xl border border-gray-100 bg-white p-2 shadow-xl"
          >
            {statusOptions.map((option) => {
              const active = statusFilter === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => changeStatus(option.value)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    active
                      ? "bg-green-50 text-green-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <StatusDot status={option.value} />

                    {option.label}
                  </span>

                  {active && <Check size={16} className="text-green-600" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------
   STATUS DOT
-------------------------------- */

function StatusDot({ status }: { status: VendorStatus }) {
  if (status === "active") {
    return <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />;
  }

  if (status === "past_due") {
    return <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-yellow-400" />;
  }

  if (status === "cancelled") {
    return <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />;
  }

  if (status === "inactive") {
    return <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gray-400" />;
  }

  return <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gray-300" />;
}
