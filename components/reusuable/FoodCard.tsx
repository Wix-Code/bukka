"use client";

import { useEffect, useState } from "react";
import { Eye, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type FoodProps = {
  phone?: string;
  vendorId: string;
  vendorName?: string;

  food: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    phone?: string;
  };
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const clean = (v?: string | null) => {
  const s = (v ?? "").trim();

  return s && !["none", "null", "undefined"].includes(s.toLowerCase()) ? s : "";
};

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

// wa.me requires digits only.
// Nigerian numbers beginning with 0 are converted to 234.
function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  return digits.startsWith("0") ? `234${digits.slice(1)}` : digits;
}

function buildOrderMessage(opts: {
  name: string;
  description?: string;
  price: number;
  quantity?: number;
  vendorName?: string;
}) {
  const { name, price, quantity = 1, vendorName } = opts;

  const description = clean(opts.description);

  const total = price * quantity;

  const lines: (string | false)[] = [
    "🍽️ *NEW ORDER REQUEST*",
    "━━━━━━━━━━━━━━━",

    vendorName
      ? `Hello *${vendorName}*, I'd like to place an order:`
      : "Hello, I'd like to place an order:",

    "",

    `*${name}*`,

    description ? `_${description}_` : false,

    "",

    `💰 Price: ${naira(price)}`,
    `🔢 Quantity: ${quantity}`,
    `🧾 Total: *${naira(total)}*`,

    "━━━━━━━━━━━━━━━",

    "Please confirm availability and delivery time. Thank you! 🙏",
  ];

  return lines.filter((line): line is string => line !== false).join("\n");
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function FoodCard({
  food,
  phone,
  vendorId,
  vendorName,
}: FoodProps) {
  const [placing, setPlacing] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);

  const orderPhone = food.phone ?? phone;

  // Close preview with Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreviewOpen(false);
      }
    }

    if (previewOpen) {
      document.addEventListener("keydown", handleEscape);

      // Prevent page scrolling behind modal
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);

      document.body.style.overflow = "";
    };
  }, [previewOpen]);

  async function handleOrder() {
    if (!orderPhone || placing) {
      return;
    }

    setPlacing(true);

    // Open immediately before await
    // so browsers don't block the popup.
    const newTab = window.open("", "_blank");

    try {
      const { error } = await supabase.from("orders").insert({
        vendor_id: vendorId,
        menu_item_id: food.id,
        item_name: food.name,
        item_price: food.price,
      });

      if (error) {
        console.error("Order insert failed:", error.message);
      }
    } catch (err) {
      console.error("Order insert failed:", err);
    }

    const message = buildOrderMessage({
      name: food.name,
      description: food.description,
      price: food.price,
      quantity: 1,
      vendorName: clean(vendorName),
    });

    const url = `https://wa.me/${normalizePhone(
      orderPhone,
    )}?text=${encodeURIComponent(message)}`;

    if (newTab) {
      newTab.location.href = url;
    } else {
      window.location.href = url;
    }

    setPlacing(false);
  }

  return (
    <>
      {/* FOOD CARD */}
      <div className="group overflow-hidden rounded-3xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl">
        {/* IMAGE */}
        <div className="relative h-52 overflow-hidden bg-gray-100">
          <img
            src={food.image}
            alt={food.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />

          {/* Preview button */}
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            aria-label={`View ${food.name}`}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/90 text-gray-700 shadow-md backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white hover:text-green-600 active:scale-95"
          >
            <Eye size={19} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-900">{food.name}</h3>

          {clean(food.description) && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500">
              {food.description}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between">
            <span className="text-lg font-bold text-green-600">
              {naira(food.price)}
            </span>

            {orderPhone ? (
              <button
                type="button"
                onClick={handleOrder}
                disabled={placing}
                className="rounded-full cursor-pointer bg-green-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {placing ? "Placing…" : "Order"}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-full bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-400"
              >
                Order
              </button>
            )}
          </div>
        </div>
      </div>

      {/* IMAGE PREVIEW MODAL */}
      {previewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${food.name} image preview`}
          onClick={() => setPreviewOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-[700px]"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              aria-label="Close image preview"
              className="absolute top-4 cursor-pointer right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg transition hover:bg-gray-100 hover:text-gray-900 active:scale-95"
            >
              <X size={20} />
            </button>

            {/* Preview */}
            <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex max-h-[65vh] min-h-[300px] items-center justify-center bg-black">
                <img
                  src={food.image}
                  alt={food.name}
                  className="max-h-[65vh] w-full object-contain"
                />
              </div>

              {/* Image information */}
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                      {food.name}
                    </h3>

                    {clean(food.description) && (
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                        {food.description}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-lg font-bold text-green-600 sm:text-xl">
                    {naira(food.price)}
                  </span>
                </div>

                {/* Order button inside preview */}
                {orderPhone && (
                  <button
                    type="button"
                    onClick={handleOrder}
                    disabled={placing}
                    className="mt-5 w-full cursor-pointer rounded-full bg-green-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-green-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {placing ? "Placing order…" : `Order ${food.name}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
