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
  onSave: (dish: Dish) => void;
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
  onSave,
}: Props) {
  const [form, setForm] = useState<Omit<Dish, "id">>(emptyDish);

  useEffect(() => {
    if (dish) {
      const { id, ...rest } = dish;
      setForm(rest);
    } else {
      setForm(emptyDish);
    }
  }, [dish, open]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSave({ id: dish?.id ?? crypto.randomUUID(), ...form });
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

          <Input
            label="Image URL"
            type="url"
            value={form.image}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            placeholder="https://..."
            hint="Paste a link to a photo of the dish."
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
              className="bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-green-700 transition"
            >
              {dish ? "Save changes" : "Add dish"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
