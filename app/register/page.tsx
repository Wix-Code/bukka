"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

    if (!restaurantName.trim() || !email.trim() || !password) {
      setError("Fill in your restaurant name, email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password needs to be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          restaurant_name: restaurantName.trim(),
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(
        error.message === "User already registered"
          ? "An account with that email already exists."
          : error.message,
      );
      return;
    }

    // If email confirmations are off, Supabase returns a session immediately.
    if (data.session) {
      router.push("/dashboard");
      return;
    }

    setCheckEmail(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffdf7] px-6 py-12">
      <div className="w-full  max-w-[500px]">
        <Link
          href="/"
          className="block text-center flex items-center justify-center flex-col font-bold text-xl mb-8 text-gray-900"
        >
          <img className="w-[80px]" src={"/images/logo.png"} />
          <p>Bukka</p>
        </Link>

        <div className="bg-white p-8 rounded-3xl shadow-xl">
          {checkEmail ? (
            <>
              <h1 className="text-3xl font-bold leading-tight">
                Check your email
              </h1>
              <p className="mt-2 text-gray-600">
                We sent a confirmation link to{" "}
                <span className="text-gray-900 font-medium">{email}</span>.
                Confirm your address to start setting up {restaurantName.trim()}
                .
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold leading-tight">
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
                  hint="At least 6 characters."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

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
                  {loading ? "Creating account…" : "Create account"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-gray-900 font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
