"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  label: string;
  value: string; // current public URL, "" if none set
  onChange: (url: string) => void;
  pathPrefix: string; // e.g. `${vendorId}/dishes` or `${vendorId}/cover`
  bucket?: string;
  hint?: string;
};

export default function ImageUpload({
  label,
  value,
  onChange,
  pathPrefix,
  bucket = "menu-images",
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
    const path = `${pathPrefix}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    setUploading(false);

    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(data.publicUrl);

    // Clear the file input so picking the same file again still fires onChange.
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove() {
    setPreview(null);
    setError(null);
    onChange("");
  }

  const displayImage = preview ?? (value || null);

  return (
    <div className="mb-4">
      <label className="block text-sm text-gray-600 mb-1.5">{label}</label>

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
          {displayImage ? (
            <img
              src={displayImage}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-gray-300" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="border border-gray-200 px-4 py-2 rounded-full text-sm font-medium text-gray-900 hover:border-gray-300 disabled:opacity-50 transition"
            >
              {uploading
                ? "Uploading…"
                : value
                  ? "Change photo"
                  : "Upload photo"}
            </button>

            {value && !uploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-sm text-gray-400 hover:text-red-600 transition"
              >
                Remove
              </button>
            )}
          </div>

          {hint && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
