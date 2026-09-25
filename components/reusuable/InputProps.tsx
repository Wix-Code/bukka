"use client";

import { forwardRef, useId, useState } from "react";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, type = "text", className = "", ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && showPassword ? "text" : type;

  const describedBy = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="block text-sm text-gray-600 mb-1.5">
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          type={resolvedType}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`w-full rounded-2xl border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:ring-2 ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-gray-200 focus:border-green-600 focus:ring-green-100"
          } ${isPassword ? "pr-11" : ""} ${className}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            <EyeIcon open={showPassword} className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="mt-1.5 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {!error && hint && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-gray-400">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;

function EyeIcon({ open, className }: { open: boolean; className?: string }) {
  if (open) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
      >
        <path d="M3 3l18 18" strokeLinecap="round" />
        <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c5 0 9 4 10 7-.4 1.2-1.2 2.5-2.3 3.7M6.3 6.3C4.3 7.6 2.9 9.6 2 12c1 3 5 7 10 7 1.3 0 2.5-.2 3.6-.7" />
        <path d="M9.5 9.8a3 3 0 0 0 4.2 4.2" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
