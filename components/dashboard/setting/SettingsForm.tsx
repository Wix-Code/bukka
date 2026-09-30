"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import Input from "@/components/reusuable/InputProps";
import ImageUpload from "@/components/reusuable/ImageUpload";
import ChangePasswordDialog from "./ChangePasswordDialog";

type VendorFields = {
  name: string;
  description: string;
  location: string;
  opening_hours: string;
  phone: string;
  cover_image: string;
  avatar_url: string;
};

type Props = {
  vendorId: string;
  initialVendor: VendorFields;
};

export default function SettingsForm({ vendorId, initialVendor }: Props) {
  const [form, setForm] = useState(initialVendor);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error } = await supabase
      .from("vendors")
      .update(form)
      .eq("id", vendorId);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-8">
        Update how your restaurant appears to customers.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm p-6"
      >
        <ImageUpload
          label="Profile picture"
          value={form.avatar_url}
          onChange={(url) => setForm((f) => ({ ...f, avatar_url: url }))}
          pathPrefix={`${vendorId}/avatar`}
          hint="Shown in the dashboard header."
        />

        <Input
          label="Restaurant name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1.5">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            rows={3}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition resize-none"
          />
        </div>

        <Input
          label="Location"
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
        />

        <Input
          label="Opening hours"
          value={form.opening_hours}
          onChange={(e) =>
            setForm((f) => ({ ...f, opening_hours: e.target.value }))
          }
        />

        <Input
          label="WhatsApp number"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          hint="Include country code, e.g. 2348012345678"
        />

        <ImageUpload
          label="Cover photo"
          value={form.cover_image}
          onChange={(url) => setForm((f) => ({ ...f, cover_image: url }))}
          pathPrefix={`${vendorId}/cover`}
          hint="Shown at the top of your public menu page."
        />

        {error && (
          <p role="alert" className="mb-4 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 bg-green-600 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow-sm p-6 mt-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-gray-900">Password</p>
          <p className="text-sm text-gray-500 mt-1">
            Change the password you use to log in.
          </p>
        </div>

        <button
          onClick={() => setPasswordDialogOpen(true)}
          className="border border-gray-200 px-5 py-2.5 rounded-full text-sm font-medium text-gray-900 hover:border-gray-300 transition whitespace-nowrap"
        >
          Change password
        </button>
      </div>

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </div>
  );
}
