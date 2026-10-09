
"use client";

import { Suspense, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Input from "@/components/reusuable/InputProps";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(e: FormEvent) {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? "That email and password don't match our records."
            : error.message
        );
        return;
      }

      const redirectTo = searchParams.get("redirectTo");

      router.push(
        redirectTo?.startsWith("/") &&
          !redirectTo.startsWith("//") &&
          !redirectTo.startsWith("/\\")
          ? redirectTo
          : "/dashboard"
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FCFAFD] px-6 py-12">
      {/* Background decorations */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[450px] w-[450px] rounded-full bg-[#D9BDE8]/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-[#F6DFE7]/60 blur-3xl" />

      <div className="relative z-10 w-full max-w-[500px]">
        {/* Brand */}
        <Link
          href="/"
          className="mb-8 flex flex-col items-center justify-center text-center"
        >
          <img
            className="w-[80px] object-contain"
            src="/images/logo.png"
            alt="Brand logo"
          />
          <p className="mt-2 text-xl font-bold tracking-tight text-[#351B46]">
            Bukka
          </p>
        </Link>

        {/* Login Card */}
        <div className="rounded-3xl border border-[#EADFF0] bg-white p-8 shadow-xl shadow-[#351B46]/5 sm:p-10">
          <div className="mb-8">
            <div className="mb-5 inline-flex items-center rounded-full border border-[#E8D5F0] bg-[#F7F0FA] px-4 py-2 text-xs font-semibold tracking-wide text-[#763C92]">
              YOUR STORE, YOUR STYLE
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#351B46]">
              Welcome back
            </h1>

            <p className="mt-3 leading-7 text-gray-500">
              Log in to manage your online store, products, and orders.
            </p>
          </div>

          <form onSubmit={login} noValidate>
            <div className="space-y-1">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="-mt-2 mb-6 flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[#763C92] transition-colors hover:text-[#351B46]"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#763C92] py-4 font-semibold text-white shadow-lg shadow-[#763C92]/20 transition-all duration-300 hover:bg-[#5D2D75] hover:shadow-xl hover:shadow-[#763C92]/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>
        </div>

        {/* Registration */}
        <p className="mt-8 text-center text-sm text-gray-600">
          New to Bukka?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#763C92] transition-colors hover:text-[#351B46] hover:underline"
          >
            Create an account
          </Link>
        </p>

        <p className="mt-5 text-center text-xs text-gray-400">
          A simpler way to showcase and sell your products.
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
