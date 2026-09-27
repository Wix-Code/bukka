"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Input from "@/components/reusuable/InputProps";
import ImageUpload from "@/components/reusuable/ImageUpload";

export type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dish: Dish | null; // null = adding a new dish
  vendorId: string;
  // Returns an error message on failure, or null on success. The dialog
  // stays open and shows the error if this doesn't resolve to null.
  onSave: (values: Omit<Dish, "id">, id?: string) => Promise<string | null>;
};

const emptyDish: Omit<Dish, "id"> = {
  name: "",
  description: "",
  price: 0,
  image: "",
  available: true,
};

export default function DishFormDialog({
  open,
  onOpenChange,
  dish,
  vendorId,
  onSave,
}: Props) {
  const [form, setForm] = useState<Omit<Dish, "id">>(emptyDish);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (dish) {
      const { id, ...rest } = dish;
      setForm(rest);
    } else {
      setForm(emptyDish);
    }
    setSaveError(null);
  }, [dish, open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    const error = await onSave(form, dish?.id);

    setSaving(false);

    if (error) {
      setSaveError(error);
      return;
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dish ? "Edit dish" : "Add a new dish"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2">
          <Input
            label="Dish name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Jollof Rice & Chicken"
            required
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
              placeholder="Smoky party jollof with grilled chicken"
              rows={3}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition resize-none"
            />
          </div>

          <Input
            label="Price (₦)"
            type="number"
            min={0}
            value={form.price || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, price: Number(e.target.value) }))
            }
            placeholder="3500"
            required
          />

          <ImageUpload
            label="Dish photo"
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
            pathPrefix={`${vendorId}/dishes`}
            hint="JPG or PNG works best."
          />

          <label className="flex items-center gap-2.5 mb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) =>
                setForm((f) => ({ ...f, available: e.target.checked }))
              }
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Available on the menu</span>
          </label>

          {saveError && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {saveError}
            </p>
          )}

          <DialogFooter className="mt-6">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? "Saving…" : dish ? "Save changes" : "Add dish"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
