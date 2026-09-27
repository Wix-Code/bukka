"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type FoodProps = {
  phone?: string;
  vendorId: string;
  food: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    phone?: string;
  };
};

export default function FoodCard({ food, phone, vendorId }: FoodProps) {
  const [placing, setPlacing] = useState(false);
  const orderPhone = food.phone ?? phone;

  async function handleOrder() {
    if (!orderPhone || placing) return;
    setPlacing(true);

    // Open the tab synchronously, in direct response to the click — most
    // browsers block window.open() calls made after an `await`, so this
    // has to happen before the insert below, not after it.
    const newTab = window.open("", "_blank");

    // Best-effort: record the order for the dashboard. If this fails, the
    // customer should still be able to reach WhatsApp — don't block on it.
    await supabase.from("orders").insert({
      vendor_id: vendorId,
      menu_item_id: food.id,
      item_name: food.name,
      item_price: food.price,
    });

    const message = `Hi, I'd like to order: ${food.name} — ₦${food.price.toLocaleString()}`;
    const url = `https://wa.me/${orderPhone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

    if (newTab) {
      newTab.location.href = url;
    } else {
      // Popup was blocked anyway — fall back to navigating the current tab.
      window.location.href = url;
    }

    setPlacing(false);
  }

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-52 overflow-hidden">
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900">{food.name}</h3>

        <p className="mt-1.5 text-gray-500 text-sm leading-relaxed line-clamp-2">
          {food.description}
        </p>

        <div className="flex justify-between items-center mt-5">
          <span className="font-bold text-green-600 text-lg">
            ₦{food.price.toLocaleString()}
          </span>

          {orderPhone ? (
            <button
              onClick={handleOrder}
              disabled={placing}
              className="bg-green-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-green-700 active:scale-95 disabled:opacity-60 transition"
            >
              {placing ? "Placing…" : "Order"}
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-100 text-gray-400 px-6 py-2.5 rounded-full text-sm font-medium cursor-not-allowed"
            >
              Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
