"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Input from "@/components/reusuable/InputProps";

export default function ResetPassword() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password needs to be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    setError(null);

    // Supabase reads the recovery token from the URL and already has a
    // session by the time this page loads, so updateUser just needs the
    // new password.
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
    await supabase.auth.signOut();
    setTimeout(() => router.push("/login"), 2500);
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
          {done ? (
            <>
              <h1 className="text-3xl font-bold leading-tight">
                Password updated
              </h1>
              <p className="mt-2 text-gray-600">
                Taking you back to log in with your new password&hellip;
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold leading-tight">
                Set a new password
              </h1>
              <p className="mt-2 text-gray-600">
                Choose a new password for your account.
              </p>

              <form onSubmit={submit} noValidate className="mt-8">
                <Input
                  label="New password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  hint="At least 6 characters."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <Input
                  label="Confirm password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {loading ? "Updating…" : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
