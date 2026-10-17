"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";

import { supabase } from "@/lib/supabase";
import Input from "@/components/reusuable/InputProps";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail) {
      setError("Enter the email address you registered with.");
      return;
    }

    if (!emailRegex.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        },
      );

      if (resetError) {
        if (resetError.status === 429) {
          setError(
            "Too many reset requests. Please wait a few minutes before trying again.",
          );
          return;
        }

        setError(
          resetError.message ||
            "Unable to process your request. Please try again.",
        );
        return;
      }

      setSubmittedEmail(normalizedEmail);
      setSent(true);
    } catch (err) {
      console.error("Password reset request failed:", err);

      setError(
        "Something went wrong. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function tryAgain() {
    setSent(false);
    setError(null);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] px-6 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <Link
          href="/"
          className="mb-8 flex flex-col items-center justify-center text-center"
        >
          <Image
            src="/images/logo.png"
            alt="Bukka logo"
            width={80}
            height={80}
            className="object-contain"
            priority
          />

          <span className="mt-2 text-xl font-bold text-gray-900">Bukka</span>
        </Link>

        {/* Main card */}
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          {sent ? (
            <div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 6L2 7" />
                </svg>
              </div>

              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                Check your email
              </h1>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                If an account exists for{" "}
                <span className="font-semibold text-gray-900">
                  {submittedEmail}
                </span>
                , you'll receive an email with a link to reset your password.
              </p>

              <p className="mt-4 text-sm leading-6 text-gray-500">
                Check your inbox and spam folder. The reset link may take a few
                minutes to arrive.
              </p>

              <Link
                href="/login"
                className="mt-7 flex w-full items-center justify-center rounded-full bg-green-600 py-4 font-medium text-white transition hover:bg-green-700"
              >
                Back to login
              </Link>

              <button
                type="button"
                onClick={tryAgain}
                className="mt-4 w-full text-center text-sm font-medium text-gray-600 transition hover:text-gray-900"
              >
                Wrong email? Try again
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                Reset your password
              </h1>

              <p className="mt-2 leading-7 text-gray-600">
                Enter your registered email address and we'll send you
                instructions to reset your password.
              </p>

              <form onSubmit={submit} noValidate className="mt-8">
                <Input
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                {error && (
                  <div
                    role="alert"
                    className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-full bg-green-600 py-4 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending...
                    </span>
                  ) : (
                    "Send reset link"
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {!sent && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Remembered your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-green-700 hover:underline"
            >
              Log in
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
