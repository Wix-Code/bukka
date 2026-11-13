"use client";

import { useState, useRef, useEffect } from "react";
import {
  Clock3,
  Copy,
  CalendarDays,
  ChevronDown,
  Check,
  X,
} from "lucide-react";

type DaySchedule = {
  day: string;
  isOpen: boolean;
  open: string;
  close: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const STORAGE_KEY = "mybukka-weekly-hours";

const defaultSchedule: DaySchedule[] = [
  { day: "Monday", isOpen: true, open: "08:00", close: "22:00" },
  { day: "Tuesday", isOpen: true, open: "08:00", close: "22:00" },
  { day: "Wednesday", isOpen: true, open: "08:00", close: "22:00" },
  { day: "Thursday", isOpen: true, open: "08:00", close: "22:00" },
  { day: "Friday", isOpen: true, open: "08:00", close: "22:00" },
  { day: "Saturday", isOpen: true, open: "08:00", close: "22:00" },
  { day: "Sunday", isOpen: false, open: "08:00", close: "22:00" },
];

function parseSchedule(value: string): DaySchedule[] {
  if (!value) return defaultSchedule.map((day) => ({ ...day }));

  try {
    const parsed = JSON.parse(value);

    if (
      parsed?.format === STORAGE_KEY &&
      Array.isArray(parsed.days) &&
      parsed.days.length === 7
    ) {
      return parsed.days;
    }
  } catch {
    // Preserve legacy plain-text values until the user edits the schedule.
  }

  return defaultSchedule.map((day) => ({ ...day }));
}

function formatTime(time: string) {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

function to24Hour(hour: number, minute: number, period: string) {
  const convertedHour = period === "PM" ? (hour % 12) + 12 : hour % 12;

  return `${String(convertedHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function from24Hour(value: string) {
  const [hours, minutes] = value.split(":").map(Number);

  return {
    hour: hours % 12 || 12,
    minute: minutes,
    period: hours >= 12 ? "PM" : "AM",
  };
}

type TimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
};

function CustomTimePicker({ value, onChange, label }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = from24Hour(value || "09:00");

  const [hour, setHour] = useState(selected.hour);
  const [minute, setMinute] = useState(selected.minute);
  const [period, setPeriod] = useState(selected.period);

  useEffect(() => {
    if (!open) return;

    const current = from24Hour(value || "09:00");
    setHour(current.hour);
    setMinute(current.minute);
    setPeriod(current.period);
  }, [open, value]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function applyTime() {
    onChange(to24Hour(hour, minute, period));
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-1.5 block text-xs font-medium text-gray-500">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between rounded-xl border bg-white px-3 py-3 text-sm transition ${
          open
            ? "border-green-600 ring-2 ring-green-100"
            : "border-gray-200 hover:border-green-400"
        }`}
      >
        <span className="flex items-center gap-2 text-gray-800">
          <Clock3 size={16} className="text-green-600" />
          <span className="font-semibold">{formatTime(value)}</span>
        </span>

        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[min(290px,calc(100vw-48px))] rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Select {label.toLowerCase()}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                Choose your preferred time
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close time picker"
            >
              <X size={17} />
            </button>
          </div>

          <div className="rounded-xl bg-green-50 px-4 py-4 text-center">
            <span className="text-3xl font-bold tracking-tight text-green-800">
              {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}
            </span>
            <span className="ml-2 text-sm font-bold text-green-700">
              {period}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_1fr_auto] gap-3">
            <div>
              <p className="mb-2 text-center text-xs font-semibold text-gray-500">
                HOUR
              </p>

              <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl bg-gray-50 p-1">
                {Array.from({ length: 12 }, (_, index) => index + 1).map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setHour(item)}
                      className={`w-full rounded-lg py-2 text-sm font-medium transition ${
                        hour === item
                          ? "bg-green-600 text-white shadow-sm"
                          : "text-gray-600 hover:bg-green-50"
                      }`}
                    >
                      {String(item).padStart(2, "0")}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-center text-xs font-semibold text-gray-500">
                MINUTE
              </p>

              <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl bg-gray-50 p-1">
                {Array.from({ length: 12 }, (_, index) => index * 5).map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setMinute(item)}
                      className={`w-full rounded-lg py-2 text-sm font-medium transition ${
                        minute === item
                          ? "bg-green-600 text-white shadow-sm"
                          : "text-gray-600 hover:bg-green-50"
                      }`}
                    >
                      {String(item).padStart(2, "0")}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-center text-xs font-semibold text-gray-500">
                PERIOD
              </p>

              <div className="space-y-1 rounded-xl bg-gray-50 p-1">
                {["AM", "PM"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPeriod(item)}
                    className={`w-full rounded-lg px-2 py-2.5 text-xs font-semibold transition ${
                      period === item
                        ? "bg-green-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-green-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={applyTime}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            <Check size={16} />
            Apply time
          </button>
        </div>
      )}
    </div>
  );
}

export default function OpeningHoursEditor({ value, onChange }: Props) {
  const [days, setDays] = useState<DaySchedule[]>(() => parseSchedule(value));

  const [copied, setCopied] = useState(false);

  const isLegacyValue =
    Boolean(value) && !value.includes(`"format":"${STORAGE_KEY}"`);

  function saveSchedule(updated: DaySchedule[]) {
    setDays(updated);

    onChange(
      JSON.stringify({
        format: STORAGE_KEY,
        days: updated,
      }),
    );
  }

  function updateDay(index: number, updates: Partial<DaySchedule>) {
    const updated = days.map((day, i) =>
      i === index ? { ...day, ...updates } : day,
    );

    saveSchedule(updated);
  }

  function copyMondayToWeekdays() {
    const monday = days[0];

    const updated = days.map((day, index) =>
      index >= 1 && index <= 4
        ? {
            ...day,
            isOpen: monday.isOpen,
            open: monday.open,
            close: monday.close,
          }
        : day,
    );

    saveSchedule(updated);

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Opening hours</h3>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Set the hours customers can visit your restaurant.
          </p>
        </div>

        <button
          type="button"
          onClick={copyMondayToWeekdays}
          className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? "Copied!" : "Copy Monday to weekdays"}
        </button>
      </div>

      {isLegacyValue && (
        <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          <p className="font-medium">Previously saved hours</p>
          <p className="mt-1">{value}</p>
          <p className="mt-2 text-xs">
            Configure your weekly schedule below to replace these hours. Your
            existing value is preserved until you make a change.
          </p>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {days.map((day, index) => (
          <div
            key={day.day}
            className="rounded-xl border border-gray-100 bg-gray-50/70 p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="w-24 text-sm font-semibold text-gray-800">
                {day.day}
              </span>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium ${
                    day.isOpen ? "text-green-700" : "text-gray-500"
                  }`}
                >
                  {day.isOpen ? "Open" : "Closed"}
                </span>

                <button
                  type="button"
                  role="switch"
                  aria-checked={day.isOpen}
                  aria-label={`${day.day} opening status`}
                  onClick={() => updateDay(index, { isOpen: !day.isOpen })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    day.isOpen ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      day.isOpen ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {day.isOpen && (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CustomTimePicker
                  label="Opening time"
                  value={day.open}
                  onChange={(time) => updateDay(index, { open: time })}
                />

                <CustomTimePicker
                  label="Closing time"
                  value={day.close}
                  onChange={(time) => updateDay(index, { close: time })}
                />
              </div>
            )}

            {day.isOpen && (
              <p className="mt-3 text-xs font-medium text-gray-500">
                {formatTime(day.open)} – {formatTime(day.close)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
