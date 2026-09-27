"use client";

import { useState } from "react";
import { Add, Edit2, Trash } from "iconsax-react";
import { supabase } from "@/lib/supabase";
import DishFormDialog, {
  type Dish,
} from "@/components/dashboard/menu/DishFormDialog";
import DeleteDishDialog from "@/components/dashboard/menu/DeleteDishDialog";

type Props = {
  vendorId: string;
  initialDishes: Dish[];
};

export default function MenuManager({ vendorId, initialDishes }: Props) {
  const [dishes, setDishes] = useState<Dish[]>(initialDishes);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [deletingDish, setDeletingDish] = useState<Dish | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  function openAddDialog() {
    setEditingDish(null);
    setFormOpen(true);
  }

  function openEditDialog(dish: Dish) {
    setEditingDish(dish);
    setFormOpen(true);
  }

  async function handleSave(
    values: Omit<Dish, "id">,
    id?: string,
  ): Promise<string | null> {
    if (id) {
      const { data, error } = await supabase
        .from("menu_items")
        .update(values)
        .eq("id", id)
        .select()
        .single();

      if (error) return error.message;

      setDishes((prev) => prev.map((d) => (d.id === id ? (data as Dish) : d)));
      return null;
    }

    const { data, error } = await supabase
      .from("menu_items")
      .insert({ ...values, vendor_id: vendorId })
      .select()
      .single();

    if (error) return error.message;

    setDishes((prev) => [data as Dish, ...prev]);
    return null;
  }

  async function handleDelete(dish: Dish) {
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", dish.id);

    if (error) {
      setPageError(error.message);
      return;
    }

    setPageError(null);
    setDishes((prev) => prev.filter((d) => d.id !== dish.id));
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
          <p className="text-sm text-gray-500 mt-1">
            {dishes.length} dish{dishes.length === 1 ? "" : "es"} on your menu
          </p>
        </div>

        <button
          onClick={openAddDialog}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-green-700 transition"
        >
          <Add size={18} color="currentColor" />
          Add dish
        </button>
      </div>

      {pageError && (
        <div className="mb-6 rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">
          {pageError}
        </div>
      )}

      {dishes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-gray-500">
            You haven&rsquo;t added any dishes yet.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.map((dish) => (
            <div
              key={dish.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm"
            >
              <div className="relative h-40">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover"
                />
                {!dish.available && (
                  <span className="absolute top-3 left-3 bg-gray-900/80 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    Unavailable
                  </span>
                )}
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start gap-3">
                  <h3 className="font-bold text-gray-900">{dish.name}</h3>
                  <span className="font-bold text-green-600 text-sm whitespace-nowrap">
                    ₦{dish.price.toLocaleString()}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">
                  {dish.description}
                </p>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEditDialog(dish)}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 rounded-full py-2 text-sm font-medium text-gray-700 hover:border-gray-300 transition"
                  >
                    <Edit2 size={16} color="currentColor" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingDish(dish)}
                    aria-label={`Remove ${dish.name}`}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50 transition"
                  >
                    <Trash size={16} color="currentColor" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DishFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        dish={editingDish}
        vendorId={vendorId}
        onSave={handleSave}
      />

      <DeleteDishDialog
        open={!!deletingDish}
        onOpenChange={(open) => !open && setDeletingDish(null)}
        dishName={deletingDish?.name}
        onConfirm={() => deletingDish && handleDelete(deletingDish)}
      />
    </div>
  );
}
