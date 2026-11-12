"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, MapPin, Search, X } from "lucide-react";

export type RestaurantLocation = {
  country: string;
  state: string;
  lga: string;
  city: string;
  street_address: string;
};

type Props = {
  value: RestaurantLocation;
  onChange: (value: RestaurantLocation) => void;
};

type LgaData = Record<string, string[]>;

type CustomDropdownProps = {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  searchable?: boolean;
};

function CustomDropdown({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled = false,
  loading = false,
  searchable = true,
}: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (open && searchable) {
      searchRef.current?.focus();
    }
  }, [open, searchable]);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase()),
  );

  function selectOption(option: string) {
    onChange(option);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={dropdownRef} className="relative">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Dropdown trigger */}
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3.5 text-left transition-all duration-200 ${
          open
            ? "border-green-600 ring-4 ring-green-50"
            : "border-gray-200 hover:border-gray-300"
        } ${
          disabled || loading
            ? "cursor-not-allowed bg-gray-50 text-gray-400"
            : "cursor-pointer"
        }`}
      >
        <span
          className={`text-sm ${
            value ? "font-medium text-gray-900" : "text-gray-400"
          }`}
        >
          {loading ? "Loading..." : value || placeholder}
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Custom dropdown panel */}
      {open && !disabled && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
          {/* Search */}
          {searchable && (
            <div className="border-b border-gray-100 p-3">
              <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3">
                <Search size={17} className="shrink-0 text-gray-400" />

                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${label.toLowerCase()}...`}
                  className="h-10 w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="text-gray-400 transition hover:text-gray-700"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options */}
          <div
            role="listbox"
            aria-label={label}
            className="max-h-60 overflow-y-auto p-2"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const selected = value === option;

                return (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => selectOption(option)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition ${
                      selected
                        ? "bg-green-50 font-semibold text-green-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{option}</span>

                    {selected && (
                      <Check size={17} className="shrink-0 text-green-600" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center">
                <Search size={22} className="mx-auto mb-2 text-gray-300" />

                <p className="text-sm font-medium text-gray-600">
                  No results found
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Try another search term.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-2.5">
            <p className="text-xs text-gray-400">
              {filteredOptions.length}{" "}
              {filteredOptions.length === 1 ? "option" : "options"} available
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RestaurantLocationForm({ value, onChange }: Props) {
  const [states, setStates] = useState<string[]>([]);
  const [lgasByState, setLgasByState] = useState<LgaData>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadLocationData() {
      try {
        setLoading(true);
        setLoadError(null);

        const [statesResponse, lgasResponse] = await Promise.all([
          fetch("/data/nigeria/states.json"),
          fetch("/data/nigeria/lgas.json"),
        ]);

        if (!statesResponse.ok || !lgasResponse.ok) {
          throw new Error("Could not load Nigerian location data.");
        }

        const statesData: string[] = await statesResponse.json();
        const lgasData: LgaData = await lgasResponse.json();

        if (!Array.isArray(statesData) || !lgasData) {
          throw new Error("The location data has an invalid format.");
        }

        if (active) {
          setStates(statesData);
          setLgasByState(lgasData);
        }
      } catch (error) {
        console.error("Location data error:", error);

        if (active) {
          setLoadError(
            "Unable to load states and LGAs. Please refresh the page.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadLocationData();

    return () => {
      active = false;
    };
  }, []);

  const availableLgas = value.state ? (lgasByState[value.state] ?? []) : [];

  function updateField(field: keyof RestaurantLocation, fieldValue: string) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  function handleStateChange(state: string) {
    onChange({
      ...value,
      state,
      lga: "",
    });
  }

  function handleCountryChange(country: string) {
    onChange({
      ...value,
      country,
      state: "",
      lga: "",
      city: "",
      street_address: "",
    });
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-4 focus:ring-green-50";

  return (
    <div className="my-7 space-y-5">
      {/* Section heading */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
          <MapPin size={19} className="text-green-600" />
        </div>

        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Restaurant location
          </h3>

          <p className="mt-1 text-sm leading-5 text-gray-500">
            Where can customers find your restaurant?
          </p>
        </div>
      </div>

      {/* Loading error */}
      {loadError && (
        <div
          role="alert"
          className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600"
        >
          {loadError}
        </div>
      )}

      {/* Country */}
      <CustomDropdown
        label="Country"
        placeholder="Select country"
        value={value.country}
        options={["Nigeria"]}
        onChange={handleCountryChange}
      />

      {/* State */}
      <CustomDropdown
        label="State"
        placeholder="Select your state"
        value={value.state}
        options={states}
        onChange={handleStateChange}
        loading={loading}
        disabled={!!loadError}
      />

      {/* LGA */}
      <CustomDropdown
        label="Local Government Area (LGA)"
        placeholder={value.state ? "Select your LGA" : "Select a state first"}
        value={value.lga}
        options={availableLgas}
        onChange={(lga) => updateField("lga", lga)}
        disabled={!value.state || loading || !!loadError}
      />

      {/* City */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          City / Town
        </label>

        <input
          type="text"
          value={value.city}
          onChange={(e) => updateField("city", e.target.value)}
          placeholder="e.g. Aba, Aboh, Owerri"
          className={inputClass}
        />

        <p className="mt-1.5 text-xs text-gray-400">
          Enter your city, town, community or neighbourhood.
        </p>
      </div>

      {/* Street address */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Street address
        </label>

        <textarea
          value={value.street_address}
          onChange={(e) => updateField("street_address", e.target.value)}
          rows={3}
          placeholder="Street name, building number or nearby landmark"
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Location preview */}
      {(value.state || value.city || value.street_address) && (
        <div className="rounded-xl border border-green-100 bg-green-50/60 p-4">
          <div className="mb-2 flex items-center gap-2">
            <MapPin size={15} className="text-green-700" />

            <span className="text-xs font-semibold uppercase tracking-wide text-green-800">
              Address preview
            </span>
          </div>

          <p className="text-sm leading-6 text-gray-700">
            {[
              value.street_address,
              value.city,
              value.lga,
              value.state,
              value.country,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
