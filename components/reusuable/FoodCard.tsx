// "use client";

// import { useState } from "react";
// import { supabase } from "@/lib/supabase";

// type FoodProps = {
//   phone?: string;
//   vendorId: string;
//   food: {
//     id: string;
//     name: string;
//     description: string;
//     price: number;
//     image: string;
//     phone?: string;
//   };
// };

// export default function FoodCard({ food, phone, vendorId }: FoodProps) {
//   const [placing, setPlacing] = useState(false);
//   const orderPhone = food.phone ?? phone;

//   async function handleOrder() {
//     if (!orderPhone || placing) return;
//     setPlacing(true);

//     // Open the tab synchronously, in direct response to the click — most
//     // browsers block window.open() calls made after an `await`, so this
//     // has to happen before the insert below, not after it.
//     const newTab = window.open("", "_blank");

//     // Best-effort: record the order for the dashboard. If this fails, the
//     // customer should still be able to reach WhatsApp — don't block on it.
//     await supabase.from("orders").insert({
//       vendor_id: vendorId,
//       menu_item_id: food.id,
//       item_name: food.name,
//       item_price: food.price,
//     });

//     const message = `Hi, I'd like to order: ${food.name} — ₦${food.price.toLocaleString()}`;
//     const url = `https://wa.me/${orderPhone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

//     if (newTab) {
//       newTab.location.href = url;
//     } else {
//       // Popup was blocked anyway — fall back to navigating the current tab.
//       window.location.href = url;
//     }

//     setPlacing(false);
//   }

//   return (
//     <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
//       <div className="relative h-52 overflow-hidden">
//         <img
//           src={food.image}
//           alt={food.name}
//           className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
//         />
//       </div>

//       <div className="p-5">
//         <h3 className="text-xl font-bold text-gray-900">{food.name}</h3>

//         <p className="mt-1.5 text-gray-500 text-sm leading-relaxed line-clamp-2">
//           {food.description}
//         </p>

//         <div className="flex justify-between items-center mt-5">
//           <span className="font-bold text-green-600 text-lg">
//             ₦{food.price.toLocaleString()}
//           </span>

//           {orderPhone ? (
//             <button
//               onClick={handleOrder}
//               disabled={placing}
//               className="bg-green-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-green-700 active:scale-95 disabled:opacity-60 transition"
//             >
//               {placing ? "Placing…" : "Order"}
//             </button>
//           ) : (
//             <button
//               disabled
//               className="bg-gray-100 text-gray-400 px-6 py-2.5 rounded-full text-sm font-medium cursor-not-allowed"
//             >
//               Order
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type FoodProps = {
  phone?: string;
  vendorId: string;
  vendorName?: string; // optional: personalises the greeting
  food: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    phone?: string;
  };
};

// ── Helpers ──────────────────────────────────────────────────────────────

// Your API returns "None" strings for nulls, so treat those as empty
const clean = (v?: string | null) => {
  const s = (v ?? "").trim();
  return s && !["none", "null", "undefined"].includes(s.toLowerCase()) ? s : "";
};

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

// wa.me needs digits only, in international format (no + and no leading 0)
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
    description ? `_${description}_` : false, // skipped entirely when empty
    "",
    `💰 Price: ${naira(price)}`,
    `🔢 Quantity: ${quantity}`,
    `🧾 Total: *${naira(total)}*`,
    "━━━━━━━━━━━━━━━",
    "Please confirm availability and delivery time. Thank you! 🙏",
  ];

  return lines.filter((l): l is string => l !== false).join("\n");
}

// ── Component ────────────────────────────────────────────────────────────

export default function FoodCard({
  food,
  phone,
  vendorId,
  vendorName,
}: FoodProps) {
  const [placing, setPlacing] = useState(false);
  const orderPhone = food.phone ?? phone;

  async function handleOrder() {
    if (!orderPhone || placing) return;
    setPlacing(true);

    // Must open synchronously on click, before any await, or browsers block it.
    const newTab = window.open("", "_blank");

    try {
      // Best-effort: record the order. Supabase returns { error } instead of
      // throwing, but a network failure can still throw, so guard both.
      const { error } = await supabase.from("orders").insert({
        vendor_id: vendorId,
        menu_item_id: food.id,
        item_name: food.name,
        item_price: food.price,
      });
      if (error) console.error("Order insert failed:", error.message);
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

    const url = `https://wa.me/${normalizePhone(orderPhone)}?text=${encodeURIComponent(message)}`;

    if (newTab) {
      newTab.location.href = url;
    } else {
      // Popup blocked anyway, so navigate the current tab.
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
            {naira(food.price)}
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