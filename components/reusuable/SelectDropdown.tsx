"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type DropdownOption = {
  label: string;
  value: string;
};

type SelectDropdownProps = {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

export default function SelectDropdown({
  label,
  placeholder = "Select an option",
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  className = "",
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const id = useId();

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  useEffect(() => {
    if (open && focusedIndex >= 0) {
      optionRefs.current[focusedIndex]?.focus();
    }
  }, [open, focusedIndex]);

  function selectOption(option: DropdownOption) {
    onChange(option.value);
    setOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (
      e.key === "ArrowDown" ||
      e.key === "ArrowUp" ||
      e.key === "Enter" ||
      e.key === " "
    ) {
      e.preventDefault();

      const selectedIndex = options.findIndex(
        (option) => option.value === value,
      );

      const initialIndex =
        selectedIndex >= 0
          ? selectedIndex
          : e.key === "ArrowUp"
            ? options.length - 1
            : 0;

      setFocusedIndex(initialIndex);
      setOpen(true);
    }

    if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function handleOptionKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((index + 1) % options.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((index - 1 + options.length) % options.length);
    }

    if (e.key === "Home") {
      e.preventDefault();
      setFocusedIndex(0);
    }

    if (e.key === "End") {
      e.preventDefault();
      setFocusedIndex(options.length - 1);
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }

    if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={dropdownRef} className={`relative mb-4 ${className}`}>
      {label && (
        <label
          id={`${id}-label`}
          className="mb-1.5 block text-sm text-gray-600"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-labelledby={label ? `${id}-label ${id}-value` : undefined}
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            setFocusedIndex(-1);
            setOpen(true);
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        className={`flex w-full items-center justify-between rounded-2xl border bg-white px-4 py-3 text-left text-sm outline-none transition ${
          open
            ? "border-green-600 ring-2 ring-green-100"
            : "border-gray-200 hover:border-gray-300"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span
          id={`${id}-value`}
          className={
            selectedOption ? "font-medium text-gray-900" : "text-gray-400"
          }
        >
          {selectedOption?.label ?? placeholder}
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Options */}
      {open && (
        <div
          id={`${id}-listbox`}
          role="listbox"
          aria-label={label ?? placeholder}
          className="absolute left-0 z-40 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-xl"
        >
          {options.length === 0 ? (
            <p className="px-3 py-3 text-sm text-gray-400">
              No options available
            </p>
          ) : (
            options.map((option, index) => {
              const active = value === option.value;

              return (
                <button
                  key={option.value}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  type="button"
                  role="option"
                  tabIndex={focusedIndex === index ? 0 : -1}
                  aria-selected={active}
                  onClick={() => selectOption(option)}
                  onKeyDown={(e) => handleOptionKeyDown(e, index)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-green-500 ${
                    active
                      ? "bg-green-50 text-green-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span>{option.label}</span>

                  {active && (
                    <Check size={16} className="shrink-0 text-green-600" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
