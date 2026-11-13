"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import Input from "@/components/reusuable/InputProps";
import ImageUpload from "@/components/reusuable/ImageUpload";
import ChangePasswordDialog from "./ChangePasswordDialog";
import { generateSlug } from "@/lib/generaateSlug";
import { useRouter } from "next/navigation";
import OpeningHoursEditor from "@/components/reusuable/OpeningHoursEditor";
import RestaurantLocationForm from "@/components/reusuable/RestaurantLocationForm";
import type { RestaurantLocation } from "@/components/reusuable/RestaurantLocationForm";

type VendorFields = {
  name: string;
  description: string;
  location: string;
  opening_hours: string;
  phone: string;
  cover_image: string;
  avatar_url: string;
  has_dine_in: boolean;

  country?: string | null;
  state?: string | null;
  lga?: string | null;
  city?: string | null;
  street_address?: string | null;
};

type Props = {
  vendorId: string;
  initialVendor: VendorFields;
};

function formatRestaurantLocation(location: RestaurantLocation) {
  return [
    location.street_address,
    location.city,
    location.lga,
    location.state,
    location.country,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

export default function SettingsForm({ vendorId, initialVendor }: Props) {
  const [form, setForm] = useState<VendorFields>({
    ...initialVendor,
    name: initialVendor.name ?? "",
    description: initialVendor.description ?? "",
    location: initialVendor.location ?? "",
    opening_hours: initialVendor.opening_hours ?? "",
    phone: initialVendor.phone ?? "",
    cover_image: initialVendor.cover_image ?? "",
    avatar_url: initialVendor.avatar_url ?? "",
    has_dine_in: initialVendor.has_dine_in ?? false,

    country: initialVendor.country ?? "Nigeria",
    state: initialVendor.state ?? "",
    lga: initialVendor.lga ?? "",
    city: initialVendor.city ?? "",
    street_address: initialVendor.street_address ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const router = useRouter();

  const restaurantLocation: RestaurantLocation = {
    country: form.country ?? "Nigeria",
    state: form.state ?? "",
    lga: form.lga ?? "",
    city: form.city ?? "",
    street_address: form.street_address ?? "",
  };

  function handleLocationChange(location: RestaurantLocation) {
    setForm((current) => ({
      ...current,
      ...location,
      location: formatRestaurantLocation(location),
    }));

    setSaved(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);
    setSaved(false);

    const restaurantName = form.name.trim();

    if (!restaurantName) {
      setError("Restaurant name cannot be empty.");
      return;
    }

    const newSlug = generateSlug(restaurantName);

    if (!newSlug) {
      setError("Please enter a valid restaurant name.");
      return;
    }

    const locationToSave = formatRestaurantLocation(restaurantLocation);

    // Preserve the old location if the vendor has not entered
    // any structured address information.
    const hasStructuredAddress = Boolean(
      restaurantLocation.state ||
      restaurantLocation.lga ||
      restaurantLocation.city ||
      restaurantLocation.street_address,
    );

    const formattedLocation = hasStructuredAddress
      ? locationToSave
      : form.location.trim();

    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from("vendors")
        .update({
          name: restaurantName,
          slug: newSlug,
          description: form.description.trim(),

          // Existing location column, retained for compatibility.
          location: formattedLocation,

          // Structured restaurant location.
          country: restaurantLocation.country,
          state: restaurantLocation.state || null,
          lga: restaurantLocation.lga || null,
          city: restaurantLocation.city.trim() || null,
          street_address: restaurantLocation.street_address.trim() || null,

          opening_hours: form.opening_hours || "",
          phone: form.phone.trim(),
          cover_image: form.cover_image,
          avatar_url: form.avatar_url,
          has_dine_in: form.has_dine_in,
        })
        .eq("id", vendorId)
        .select("id")
        .single();

      if (updateError) {
        if (updateError.code === "23505") {
          throw new Error(
            "A restaurant already uses this name. Please choose another name.",
          );
        }

        throw updateError;
      }

      setSaved(true);

      // Refresh server components with the updated vendor information.
      router.refresh();
    } catch (err) {
      console.error("Settings update error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update restaurant settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-[700px]">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Settings</h1>

      <p className="mb-8 text-sm text-gray-500">
        Update how your restaurant appears to customers.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white p-6 shadow-sm"
      >
        {/* Profile picture */}
        <ImageUpload
          label="Profile picture"
          value={form.avatar_url}
          onChange={(url) => {
            setForm((f) => ({ ...f, avatar_url: url }));
            setSaved(false);
          }}
          pathPrefix={`${vendorId}/avatar`}
          hint="Shown in the dashboard header."
        />

        {/* Restaurant name */}
        <Input
          label="Restaurant name"
          value={form.name}
          onChange={(e) => {
            setForm((f) => ({ ...f, name: e.target.value }));
            setSaved(false);
          }}
        />

        {/* Description */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm text-gray-600">
            Description
          </label>

          <textarea
            value={form.description}
            onChange={(e) => {
              setForm((f) => ({
                ...f,
                description: e.target.value,
              }));
              setSaved(false);
            }}
            rows={3}
            className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        {/* Restaurant location */}
        <RestaurantLocationForm
          value={restaurantLocation}
          onChange={handleLocationChange}
        />

        {/* Show old address when the vendor has not entered structured data */}
        {!form.state &&
          !form.lga &&
          !form.city &&
          !form.street_address &&
          form.location && (
            <div className="mb-4 rounded-xl bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500">
                Previously saved location
              </p>
              <p className="mt-1 text-sm text-gray-700">{form.location}</p>
              <p className="mt-1 text-xs text-gray-400">
                Select your state and enter your address above to replace this
                old location with structured address details.
              </p>
            </div>
          )}

        {/* Opening hours */}
        <OpeningHoursEditor
          value={form.opening_hours}
          onChange={(value) => {
            setForm((f) => ({
              ...f,
              opening_hours: value,
            }));
            setSaved(false);
          }}
        />

        {/* WhatsApp number */}
        <Input
          label="WhatsApp number"
          value={form.phone}
          onChange={(e) => {
            setForm((f) => ({ ...f, phone: e.target.value }));
            setSaved(false);
          }}
          hint="Include country code, e.g. 2348012345678"
        />

        {/* Dine-in availability */}
        <div className="my-6 rounded-2xl border border-gray-200 bg-[#fffdf7] p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">
                Do you have an eatery?
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Can customers visit your location and sit down to enjoy their
                meals?
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={form.has_dine_in}
              aria-label="Dine-in availability"
              onClick={() => {
                setForm((f) => ({
                  ...f,
                  has_dine_in: !f.has_dine_in,
                }));
                setSaved(false);
              }}
              className={`relative mt-1 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                form.has_dine_in ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  form.has_dine_in ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
            <span className="text-sm font-medium text-gray-600">
              Dine-in availability
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                form.has_dine_in
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {form.has_dine_in ? "Yes, available" : "No, not available"}
            </span>
          </div>
        </div>

        {/* Cover photo */}
        <ImageUpload
          label="Cover photo"
          value={form.cover_image}
          onChange={(url) => {
            setForm((f) => ({ ...f, cover_image: url }));
            setSaved(false);
          }}
          pathPrefix={`${vendorId}/cover`}
          hint="Shown at the top of your public menu page."
        />

        {/* Error message */}
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        {/* Save settings */}
        <button
          type="submit"
          disabled={saving}
          className="mt-2 rounded-full bg-green-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved" : "Save changes"}
        </button>
      </form>

      {/* Password settings */}
      <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <p className="font-bold text-gray-900">Password</p>

          <p className="mt-1 text-sm text-gray-500">
            Change the password you use to log in.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPasswordDialogOpen(true)}
          className="whitespace-nowrap rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-900 transition hover:border-gray-300"
        >
          Change password
        </button>
      </div>

      {/* Change password dialog */}
      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </div>
  );
}
