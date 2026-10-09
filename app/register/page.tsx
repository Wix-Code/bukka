"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Input from "@/components/reusuable/InputProps";
import { ArrowRight, CheckCircle2, Mail, Sparkles } from "lucide-react";

export default function Signup() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();

    if (!businessName.trim() || !email.trim() || !password) {
      setError("Enter your business name, email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            business_name: businessName.trim(),
          },
        },
      });

      if (signupError) {
        setError(
          signupError.message === "User already registered"
            ? "An account with that email already exists."
            : signupError.message,
        );
        return;
      }

      if (data.session) {
        router.push("/dashboard");
        return;
      }

      setCheckEmail(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FCFAFD] px-6 py-12">
      {/* Decorative background */}
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

        {/* Signup card */}
        <div className="rounded-3xl border border-[#EADFF0] bg-white p-8 shadow-xl shadow-[#351B46]/5 sm:p-10">
          {checkEmail ? (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F7F0FA]">
                <Mail size={34} className="text-[#763C92]" />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#351B46]">
                Check your email
              </h1>

              <p className="mt-4 leading-7 text-gray-500">
                We've sent a confirmation link to{" "}
                <span className="font-semibold text-[#351B46]">{email}</span>.
              </p>

              <p className="mt-3 leading-7 text-gray-500">
                Confirm your email address to continue setting up{" "}
                <span className="font-semibold text-[#763C92]">
                  {businessName.trim()}
                </span>
                .
              </p>

              <div className="mt-7 flex items-center justify-center gap-2 rounded-2xl border border-[#EADFF0] bg-[#FCFAFD] px-4 py-4 text-sm text-[#763C92]">
                <CheckCircle2 size={18} />
                Your store is almost ready.
              </div>

              <Link
                href="/login"
                className="mt-8 inline-flex items-center gap-2 font-semibold text-[#763C92] hover:text-[#351B46]"
              >
                Go to login
                <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8D5F0] bg-[#F7F0FA] px-4 py-2 text-xs font-semibold tracking-wide text-[#763C92]">
                  <Sparkles size={14} />
                  YOUR BUSINESS STARTS HERE
                </div>

                <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#351B46]">
                  Create your account
                </h1>

                <p className="mt-3 leading-7 text-gray-500">
                  Build your online storefront, showcase your products and start
                  receiving orders.
                </p>
              </div>

              <form onSubmit={submit} noValidate>
                <Input
                  label="Business name"
                  type="text"
                  autoComplete="organization"
                  placeholder="e.g. Luxe Collections"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
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
                  hint="At least 6 characters."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

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
                  className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#763C92] py-4 font-semibold text-white shadow-lg shadow-[#763C92]/20 transition-all duration-300 hover:bg-[#5D2D75] hover:shadow-xl hover:shadow-[#763C92]/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Creating account…" : "Create account"}

                  {!loading && (
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-xs leading-6 text-gray-400">
                Start building your digital storefront in minutes.
              </p>
            </>
          )}
        </div>

        {/* Login link */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#763C92] transition-colors hover:text-[#351B46] hover:underline"
          >
            Log in
          </Link>
        </p>

        <p className="mt-5 text-center text-xs text-gray-400">
          Your products. Your storefront. Your customers.
        </p>
      </div>
    </div>
  );
}
