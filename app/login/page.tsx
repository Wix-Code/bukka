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

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "That email and password don't match our records."
          : error.message,
      );
      return;
    }

    router.push(searchParams.get("redirectTo") || "/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffdf7] px-6 py-12">
      <div className="w-full  max-w-[500px]">
        <Link
          href="/"
          className="block text-center font-bold text-xl mb-8 text-gray-900"
        >
          Bukka
        </Link>

        <div className="bg-white p-8 rounded-3xl shadow-xl">
          <h1 className="text-3xl font-bold leading-tight">Welcome back</h1>
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

            <div className="flex justify-end -mt-2 mb-6">
              <Link
                href="/forgot-password"
                className="text-sm text-gray-500 hover:text-gray-900 transition"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <p role="alert" className="mb-4 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white w-full py-4 rounded-full font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          New to Bukka?{" "}
          <Link
            href="/register"
            className="text-gray-900 font-medium hover:underline"
          >
            Create an account
          </Link>
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
