"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Notification } from "iconsax-react";
import { supabase } from "@/lib/supabase";

type OrderNotification = {
  id: string;
  item_name: string;
  item_price: number;
  status: string;
  created_at: string;
};

// Synthesizes a short alarm-like sound with the Web Audio API — no audio
// file to host or ship. Browsers block audio before any user interaction
// on the page at all, so the very first alarm on a completely untouched
// tab may be silent once; it'll work normally after any click/keypress.
function playAlarm() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    [0, 0.28, 0.56].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 740 + i * 160;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.35, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.24);
    });

    setTimeout(() => ctx.close(), 1200);
  } catch {
    // Unsupported browser or blocked autoplay — the visual badge still
    // shows the new order either way, so this fails silently on purpose.
  }
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

export default function NotificationBell({ vendorId }: { vendorId: string }) {
  const [orders, setOrders] = useState<OrderNotification[]>([]);
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders ?? []);
        setLastSeenAt(data.lastSeenAt ?? null);
        loaded.current = true;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`orders-vendor-${vendorId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `vendor_id=eq.${vendorId}`,
        },
        (payload) => {
          setOrders((prev) =>
            [payload.new as OrderNotification, ...prev].slice(0, 20),
          );
          // Only alarm for orders that arrive after the initial fetch has
          // resolved, so loading the page doesn't itself trigger a sound.
          if (loaded.current) playAlarm();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendorId]);

  const unreadCount = lastSeenAt
    ? orders.filter((o) => new Date(o.created_at) > new Date(lastSeenAt)).length
    : orders.length;

  async function handleToggle() {
    const next = !open;
    setOpen(next);

    if (next && unreadCount > 0) {
      const now = new Date().toISOString();
      setLastSeenAt(now);
      await supabase
        .from("vendors")
        .update({ notifications_last_seen_at: now })
        .eq("id", vendorId);
    }
  }

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        onClick={handleToggle}
        className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition"
      >
        <Notification size={20} color="currentColor" variant="Linear" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />

          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-30 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-bold text-gray-900 text-sm">Notifications</p>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {orders.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-400">
                  No orders yet.
                </p>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="px-4 py-3 border-b border-gray-50 last:border-0"
                  >
                    <p className="text-sm text-gray-900 font-medium">
                      New order: {order.item_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ₦{Number(order.item_price).toLocaleString()} ·{" "}
                      {timeAgo(order.created_at)}
                    </p>
                  </div>
                ))
              )}
            </div>

            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="block text-center py-3 text-sm font-medium text-green-700 hover:bg-gray-50 transition"
            >
              View all notifications
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
