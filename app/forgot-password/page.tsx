"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Input from "@/components/reusuable/InputProps";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      setError("Enter the email you signed up with.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffdf7] px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="block text-center flex items-center justify-center flex-col font-bold text-xl mb-8 text-gray-900"
        >
          <img className="w-[80px]" src={"/images/logo.png"} />
          <p>Bukka</p>
        </Link>

        <div className="bg-white p-8 rounded-3xl shadow-xl">
          {sent ? (
            <>
              <h1 className="text-3xl font-bold leading-tight">
                Check your email
              </h1>
              <p className="mt-2 text-gray-600">
                We sent a password reset link to{" "}
                <span className="text-gray-900 font-medium">{email}</span>.
                Follow the link to set a new password.
              </p>

              <button
                onClick={() => setSent(false)}
                className="mt-8 text-sm text-gray-500 hover:text-gray-900 transition"
              >
                Wrong email? Try again
              </button>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold leading-tight">
                Reset your password
              </h1>
              <p className="mt-2 text-gray-600">
                Enter your email and we'll send you a link to get back in.
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
                  <p role="alert" className="mb-4 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 text-white w-full py-4 rounded-full font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Remembered your password?{" "}
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
