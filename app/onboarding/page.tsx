"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/reusuable/InputProps";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    description: "",
    location: "",
    openingHours: "",
    phone: "",
    coverImage: "",
  });

  function next(e: FormEvent) {
    e.preventDefault();
    setStep(2);
  }

  async function finish(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    // TODO: persist `form` to the vendor's row in Supabase.
    await new Promise((resolve) => setTimeout(resolve, 600));

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffdf7] px-6 py-12">
      <div className="w-full max-w-lg">
        <Link
          href="/"
          className="block text-center font-bold text-xl mb-8 text-gray-900"
        >
          Bukka
        </Link>

        <div className="bg-white p-8 rounded-3xl shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <div
              className={`h-1.5 flex-1 rounded-full ${
                step >= 1 ? "bg-green-600" : "bg-gray-100"
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full ${
                step >= 2 ? "bg-green-600" : "bg-gray-100"
              }`}
            />
          </div>

          {step === 1 ? (
            <>
              <h1 className="text-3xl font-bold leading-tight">
                Tell us about your restaurant
              </h1>
              <p className="mt-2 text-gray-600">
                This appears at the top of your public menu page.
              </p>

              <form onSubmit={next} className="mt-8">
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Home-cooked Nigerian meals, made fresh daily."
                    rows={3}
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition resize-none"
                  />
                </div>

                <Input
                  label="Location"
                  placeholder="Wuse 2, Abuja"
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                  required
                />

                <Input
                  label="Opening hours"
                  placeholder="9am - 9pm"
                  value={form.openingHours}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, openingHours: e.target.value }))
                  }
                  required
                />

                <button
                  type="submit"
                  className="bg-green-600 text-white w-full py-4 rounded-full font-medium hover:bg-green-700 transition"
                >
                  Continue
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold leading-tight">
                How should orders reach you?
              </h1>
              <p className="mt-2 text-gray-600">
                Orders from your menu page will be sent here.
              </p>

              <form onSubmit={finish} className="mt-8">
                <Input
                  label="WhatsApp number"
                  placeholder="2348012345678"
                  hint="Include country code, no spaces or dashes."
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  required
                />

                <Input
                  label="Cover image URL"
                  type="url"
                  placeholder="https://..."
                  hint="A wide photo for the top of your menu page."
                  value={form.coverImage}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, coverImage: e.target.value }))
                  }
                />

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-4 rounded-full font-medium text-gray-600 hover:bg-gray-100 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-green-600 text-white py-4 rounded-full font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {saving ? "Setting up…" : "Finish setup"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
