"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { supabase } from "@/lib/supabase";
import Input from "@/components/reusuable/InputProps";
import ImageUpload from "@/components/reusuable/ImageUpload";

type Step = 1 | 2;

type OnboardingForm = {
  description: string;
  location: string;
  openingHours: string;
  phone: string;
  coverImage: string;
};

export default function Onboarding() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [vendorId, setVendorId] = useState<string | null>(null);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<OnboardingForm>({
    description: "",
    location: "",
    openingHours: "",
    phone: "",
    coverImage: "",
  });

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (!active) return;

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        setVendorId(user.id);

        // Load existing onboarding information, if present.
        const { data: vendor, error: vendorError } = await supabase
          .from("vendors")
          .select("description, location, opening_hours, phone, cover_image")
          .eq("id", user.id)
          .maybeSingle();

        if (!active) return;

        if (vendorError) {
          console.error("Vendor lookup failed:", vendorError);
          setError(
            "Unable to load your restaurant information. Please refresh and try again.",
          );
          return;
        }

        if (vendor) {
          setForm({
            description: vendor.description ?? "",
            location: vendor.location ?? "",
            openingHours: vendor.opening_hours ?? "",
            phone: vendor.phone ?? "",
            coverImage: vendor.cover_image ?? "",
          });
        }
      } catch (err) {
        if (!active) return;

        console.error("Onboarding initialization failed:", err);

        setError(
          "Unable to initialize your restaurant setup. Please try again.",
        );
      } finally {
        if (active) setCheckingAuth(false);
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [router]);

  const updateForm = (key: keyof OnboardingForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const isStep1Valid =
    form.description.trim().length > 0 &&
    form.location.trim().length > 0 &&
    form.openingHours.trim().length > 0;

  const normalizedPhone = form.phone.replace(/[\s-]/g, "");

  const isPhoneValid = /^[1-9]\d{7,14}$/.test(normalizedPhone);

  const isStep2Valid = isPhoneValid && form.coverImage.trim().length > 0;

  function next(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!isStep1Valid) {
      setError("Please complete all restaurant information.");
      return;
    }

    setStep(2);
  }

  async function finish(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (saving) return;

    setError(null);

    if (!vendorId) {
      setError("Your account could not be verified. Please log in again.");
      return;
    }

    if (!isStep1Valid || !isStep2Valid) {
      setError(
        "Please complete all fields and provide a valid WhatsApp number.",
      );
      return;
    }

    setSaving(true);

    try {
      // Revalidate the authenticated user before writing.
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user || user.id !== vendorId) {
        setError("Your session has expired. Please log in again.");
        return;
      }

      const { error: saveError } = await supabase.from("vendors").upsert(
        {
          id: user.id,
          description: form.description.trim(),
          location: form.location.trim(),
          opening_hours: form.openingHours.trim(),
          phone: normalizedPhone,
          cover_image: form.coverImage.trim(),
        },
        {
          onConflict: "id",
        },
      );

      if (saveError) {
        console.error("Vendor onboarding failed:", saveError);
        setError(saveError.message);
        return;
      }

      // User is already authenticated.
      // Send them to their restaurant dashboard.
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Onboarding failed:", err);

      setError(
        "Something went wrong while saving your restaurant. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffdf7]">
        <div role="status" className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
          <p className="text-sm text-gray-600">
            Preparing your restaurant setup...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] px-6 py-12">
      <div className="w-full max-w-lg">
        <Link
          href="/"
          className="mb-8 flex flex-col items-center justify-center text-center font-bold text-xl text-gray-900"
        >
          <Image
            src="/images/logo.png"
            alt="Bukka logo"
            width={80}
            height={80}
            className="object-contain"
            priority
          />
          <span>Bukka</span>
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-xl">
          {/* Progress indicator */}
          <div
            className="mb-6 flex items-center gap-2"
            aria-label={`Step ${step} of 2`}
          >
            <div className="h-1.5 flex-1 rounded-full bg-green-600" />
            <div
              className={`h-1.5 flex-1 rounded-full ${
                step === 2 ? "bg-green-600" : "bg-gray-100"
              }`}
            />
          </div>

          {step === 1 ? (
            <>
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                Tell us about your restaurant
              </h1>

              <p className="mt-2 text-gray-600">
                This information appears on your public menu page.
              </p>

              <form onSubmit={next} className="mt-8">
                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="mb-1.5 block text-sm text-gray-600"
                  >
                    Description
                  </label>

                  <textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    placeholder="Home-cooked Nigerian meals, made fresh daily."
                    rows={3}
                    required
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <Input
                  label="Location"
                  placeholder="Wuse 2, Abuja"
                  value={form.location}
                  onChange={(e) => updateForm("location", e.target.value)}
                  required
                />

                <Input
                  label="Opening hours"
                  placeholder="9am - 9pm"
                  value={form.openingHours}
                  onChange={(e) => updateForm("openingHours", e.target.value)}
                  required
                />

                {error && (
                  <p
                    role="alert"
                    className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!isStep1Valid}
                  className="w-full rounded-full bg-green-600 py-4 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                How should orders reach you?
              </h1>

              <p className="mt-2 text-gray-600">
                Customers will use these details to contact your restaurant.
              </p>

              <form onSubmit={finish} className="mt-8">
                <Input
                  label="WhatsApp number"
                  placeholder="2348012345678"
                  hint="Include country code, without the + sign."
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  required
                />

                {vendorId && (
                  <ImageUpload
                    label="Cover photo"
                    value={form.coverImage}
                    onChange={(url) => updateForm("coverImage", url)}
                    pathPrefix={`${vendorId}/cover`}
                    hint="Choose a wide photo for your restaurant's public menu."
                  />
                )}

                {error && (
                  <p
                    role="alert"
                    className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
                  >
                    {error}
                  </p>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStep(1);
                    }}
                    disabled={saving}
                    className="rounded-full px-6 py-4 font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving || !vendorId || !isStep1Valid || !isStep2Valid
                    }
                    className="flex-1 rounded-full bg-green-600 py-4 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Setting up..." : "Finish setup"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
