"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { supabase } from "@/lib/supabase";
import Input from "@/components/reusuable/InputProps";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (loginError) {
        const message = loginError.message.toLowerCase();

        if (
          message.includes("invalid login credentials") ||
          loginError.code === "invalid_credentials"
        ) {
          setError("Incorrect email or password. Please check your details.");
          return;
        }

        if (message.includes("email not confirmed")) {
          setError("Please verify your email address before logging in.");
          return;
        }

        if (loginError.status === 429) {
          setError("Too many login attempts. Please wait and try again.");
          return;
        }

        setError(loginError.message);
        return;
      }

      const user = data.user;

      if (!user) {
        setError("Unable to verify your account. Please try again.");
        return;
      }

      // Determine whether restaurant onboarding is complete.
      // Assumes vendors.id equals auth.users.id.
      const { data: vendor, error: vendorError } = await supabase
        .from("vendors")
        .select("id, description, location, opening_hours, phone, cover_image")
        .eq("id", user.id)
        .maybeSingle();

      if (vendorError) {
        console.error("Vendor lookup failed:", vendorError);

        setError(
          "You have logged in, but we could not load your restaurant information. Please try again.",
        );
        return;
      }

      const onboardingComplete = Boolean(
        vendor?.description?.trim() &&
        vendor?.location?.trim() &&
        vendor?.opening_hours?.trim() &&
        vendor?.phone?.trim() &&
        vendor?.cover_image?.trim(),
      );

      if (!onboardingComplete) {
        router.replace("/onboarding");
        router.refresh();
        return;
      }

      // Only allow internal application redirects.
      const requestedRedirect = searchParams.get("redirectTo");

      const safeRedirect =
        requestedRedirect?.startsWith("/") &&
        !requestedRedirect.startsWith("//") &&
        !requestedRedirect.startsWith("/\\")
          ? requestedRedirect
          : "/dashboard";

      router.replace(safeRedirect);
      router.refresh();
    } catch (err) {
      console.error("Login failed:", err);

      setError("Something went wrong while logging in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] px-6 py-12">
      <div className="w-full max-w-[500px]">
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

        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">
            Welcome back
          </h1>

          <p className="mt-2 text-gray-600">
            Log in to manage your digital menu and orders.
          </p>

          <form onSubmit={login} noValidate className="mt-8">
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

            <div className="-mt-2 mb-6 flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-gray-500 transition hover:text-gray-900"
              >
                Forgot password?
              </Link>
            </div>

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
                  Logging in...
                </span>
              ) : (
                "Log in"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          New to Bukka?{" "}
          <Link
            href="/register"
            className="font-semibold text-green-700 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fffdf7]">
          <div
            role="status"
            className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600"
          />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
