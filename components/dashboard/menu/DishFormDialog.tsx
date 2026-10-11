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
import SelectDropdown from "@/components/reusuable/SelectDropdown";

export type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  category_id: string | null;
};

export type Category = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dish: Dish | null;
  vendorId: string;
  categories: Category[];
  onSave: (values: Omit<Dish, "id">, id?: string) => Promise<string | null>;
};

const emptyDish: Omit<Dish, "id"> = {
  name: "",
  description: "",
  price: 0,
  image: "",
  available: true,
  category_id: null,
};

export default function DishFormDialog({
  open,
  onOpenChange,
  dish,
  vendorId,
  categories,
  onSave,
}: Props) {
  const [form, setForm] = useState<Omit<Dish, "id">>({
    ...emptyDish,
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (dish) {
      const { id, ...rest } = dish;

      setForm({
        ...rest,
        category_id: dish.category_id ?? null,
      });
    } else {
      setForm({ ...emptyDish });
    }

    setSaveError(null);
  }, [dish, open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (saving) return;

    if (!form.category_id) {
      setSaveError("Please select a category.");
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const error = await onSave(form, dish?.id);

      if (error) {
        setSaveError(error);
        return;
      }

      onOpenChange(false);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Could not save dish.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        {/* FIXED HEADER */}
        <DialogHeader className="shrink-0 border-b border-gray-100 px-6 py-5">
          <DialogTitle>{dish ? "Edit dish" : "Add a new dish"}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          {/* SCROLLABLE FORM BODY */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
            {/* Dish Name */}
            <Input
              label="Dish name"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  name: e.target.value,
                }))
              }
              placeholder="Jollof Rice & Chicken"
              required
            />

            {/* Category */}
            <SelectDropdown
              label="Category"
              placeholder="Select category"
              value={form.category_id ?? ""}
              onChange={(value) =>
                setForm((f) => ({
                  ...f,
                  category_id: value || null,
                }))
              }
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
              required
            />

            {/* Description */}
            <div className="mb-4">
              <label className="mb-1.5 block text-sm text-gray-600">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                placeholder="Smoky party jollof with grilled chicken"
                rows={3}
                className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Price */}
            <Input
              label="Price (₦)"
              type="number"
              min={0}
              value={form.price || ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  price: Number(e.target.value),
                }))
              }
              placeholder="3500"
              required
            />

            {/* Dish Photo */}
            <ImageUpload
              label="Dish photo"
              value={form.image}
              onChange={(url) =>
                setForm((f) => ({
                  ...f,
                  image: url,
                }))
              }
              pathPrefix={`${vendorId}/dishes`}
              hint="JPG or PNG works best."
            />

            {/* Availability */}
            <label className="mb-2 flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    available: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />

              <span className="text-sm text-gray-700">
                Available on the menu
              </span>
            </label>

            {/* Save Error */}
            {saveError && (
              <p role="alert" className="mt-2 text-sm text-red-600">
                {saveError}
              </p>
            )}
          </div>

          {/* FIXED FOOTER */}
          <div className="shrink-0 flex items-center gap-4 border-t border-gray-100 bg-white py-4 px-6">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full flex-1 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || !form.category_id}
              className="rounded-full flex-1 bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : dish ? "Save changes" : "Add dish"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
