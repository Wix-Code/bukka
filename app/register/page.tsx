"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import Input from "@/components/reusuable/InputProps";

export default function Signup() {
  const router = useRouter();

  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();

    if (loading) return;

    const name = restaurantName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    setError(null);

    if (!name || !normalizedEmail || !password) {
      setError("Fill in your restaurant name, email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password needs to be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            restaurant_name: name,
          },
        },
      });

      if (signupError) {
        const message = signupError.message.toLowerCase();

        if (
          signupError.code === "user_already_exists" ||
          message.includes("already registered") ||
          message.includes("already exists")
        ) {
          setError("This email is already in use. Please log in instead.");
          return;
        }

        setError(signupError.message);
        return;
      }

      // Some Supabase configurations return an obfuscated
      // user object when an email already exists.
      // An empty identities array may indicate this case.
      if (
        data.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0
      ) {
        setError("This email is already in use. Please log in instead.");
        return;
      }

      if (data.session) {
        router.replace("/dashboard");
        return;
      }

      setCheckEmail(true);
    } catch (err) {
      console.error("Signup error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] px-6 py-12">
      <div className="w-full max-w-[500px]">
        {/* Logo */}
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
          {checkEmail ? (
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
                If this email address is eligible for registration, you will
                receive a confirmation link at{" "}
                <span className="font-semibold text-gray-900">
                  {email.trim().toLowerCase()}
                </span>
                .
              </p>

              <p className="mt-4 text-sm leading-6 text-gray-600">
                Already registered? You can log in using your existing account
                or reset your password.
              </p>

              <Link
                href="/login"
                className="mt-7 flex w-full items-center justify-center rounded-full bg-green-600 py-4 font-medium text-white transition hover:bg-green-700"
              >
                Go to login
              </Link>

              <button
                type="button"
                onClick={() => {
                  setCheckEmail(false);
                  setPassword("");
                  setError(null);
                }}
                className="mt-4 w-full text-center text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                Create your account
              </h1>

              <p className="mt-2 text-gray-600">
                Set up your restaurant to start taking orders.
              </p>

              <form onSubmit={submit} noValidate className="mt-8">
                <Input
                  label="Restaurant name"
                  type="text"
                  autoComplete="organization"
                  placeholder="Mama Ngozi's Kitchen"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                />

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
                  autoComplete="new-password"
                  placeholder="••••••••"
                  hint="At least 8 characters."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                      Creating account...
                    </span>
                  ) : (
                    "Create account"
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {!checkEmail && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
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
