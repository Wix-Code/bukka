"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

// ─── Audio ───────────────────────────────────────────────────────────────
// One AudioContext is shared and reused. Browsers create it "suspended"
// until a user gesture happens, so we unlock it on the first interaction.
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) sharedAudioCtx = new AudioCtx();
  return sharedAudioCtx;
}

// Call from inside a user gesture (click, tap, keypress).
function unlockAudio(): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) return Promise.resolve();
  return ctx
    .resume()
    .then(() => {
      // A silent 1-sample buffer fully "blesses" the context (helps iOS Safari)
      const src = ctx.createBufferSource();
      src.buffer = ctx.createBuffer(1, 1, 22050);
      src.connect(ctx.destination);
      src.start(0);
    })
    .catch(() => {});
}

function playAlarm() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const scheduleBeeps = () => {
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
  };

  try {
    if (ctx.state === "running") {
      scheduleBeeps();
    } else {
      // Still locked: only succeeds if a gesture just happened
      ctx
        .resume()
        .then(scheduleBeeps)
        .catch(() => {});
    }
  } catch {
    // Blocked or unsupported: the badge and title flash are the fallback.
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diffMs / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

// Merge lists, de-duplicate by id, newest first, keep 20
function mergeOrders(a: OrderNotification[], b: OrderNotification[]) {
  const map = new Map<string, OrderNotification>();
  [...a, ...b].forEach((o) => map.set(o.id, o));
  return Array.from(map.values())
    .sort((x, y) => +new Date(y.created_at) - +new Date(x.created_at))
    .slice(0, 20);
}

// ─── Component ───────────────────────────────────────────────────────────
export default function NotificationBell({ vendorId }: { vendorId: string }) {
  const [orders, setOrders] = useState<OrderNotification[]>([]);
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [soundReady, setSoundReady] = useState(true); // true initially: no flash on load
  const [, setTick] = useState(0); // keeps "2m ago" fresh

  const loaded = useRef(false);
  const flashTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const originalTitle = useRef("");

  // ── Tab title flash (only while the tab is in the background) ──
  const stopTitleFlash = useCallback(() => {
    if (flashTimer.current) {
      clearInterval(flashTimer.current);
      flashTimer.current = null;
      document.title = originalTitle.current;
    }
  }, []);

  const startTitleFlash = useCallback(() => {
    if (!document.hidden || flashTimer.current) return;
    originalTitle.current = document.title;
    let on = false;
    flashTimer.current = setInterval(() => {
      document.title = on ? originalTitle.current : "🔔 New order!";
      on = !on;
    }, 1000);
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) stopTitleFlash();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      stopTitleFlash();
    };
  }, [stopTitleFlash]);

  // ── Refresh relative timestamps every minute ──
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  // ── 1) Unlock audio on the first interaction anywhere on the page ──
  // Listeners stay attached until the context is genuinely "running".
  useEffect(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const sync = () => setSoundReady(ctx.state === "running");
    sync();
    ctx.addEventListener("statechange", sync);

    const events = ["pointerdown", "keydown", "touchstart"] as const;

    const onGesture = () => {
      unlockAudio().then(() => {
        if (ctx.state === "running") {
          events.forEach((e) => window.removeEventListener(e, onGesture));
        }
      });
    };

    events.forEach((e) => window.addEventListener(e, onGesture));

    return () => {
      ctx.removeEventListener("statechange", sync);
      events.forEach((e) => window.removeEventListener(e, onGesture));
    };
  }, []);

  // ── 2) Initial load ──
  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        // Merge, so an order Realtime delivered mid-fetch isn't lost
        setOrders((prev) => mergeOrders(prev, data.orders ?? []));
        setLastSeenAt(data.lastSeenAt ?? null);
      })
      .catch((err) => console.error("Failed to load notifications:", err))
      .finally(() => {
        // Set even on failure so alarms keep working
        loaded.current = true;
      });
  }, []);

  // ── 3) Realtime subscription ──
  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function start() {
      // Realtime doesn't inherit the cookie session automatically; without
      // this, RLS silently blocks every event.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }

      if (!active) return;

      channel = supabase
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
            console.log(
              "order received",
              payload.new,
              "audio state:",
              getAudioContext()?.state,
            );
            setOrders((prev) =>
              mergeOrders(prev, [payload.new as OrderNotification]),
            );
            // Skip alarms for anything arriving during the initial load
            if (loaded.current) {
              playAlarm();
              startTitleFlash();
            }
          },
        )
        .subscribe();
    }

    start();

    // Tokens expire (1hr default); re-authorize on refresh or events stop
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.access_token) {
          supabase.realtime.setAuth(session.access_token);
        }
      },
    );

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, [vendorId, startTitleFlash]);

  const unreadCount = lastSeenAt
    ? orders.filter((o) => new Date(o.created_at) > new Date(lastSeenAt)).length
    : orders.length;

  async function handleToggle() {
    const next = !open;
    setOpen(next);

    if (next && unreadCount > 0) {
      const now = new Date().toISOString();
      setLastSeenAt(now);
      const { error } = await supabase
        .from("vendors")
        .update({ notifications_last_seen_at: now })
        .eq("id", vendorId);
      if (error) console.error("Failed to mark as seen:", error.message);
    }
  }

  return (
    <div className="relative flex items-center gap-1">
      {/* Visible only while the browser is still blocking sound */}
      {/* {!soundReady && (
        <button
          onClick={() => unlockAudio()}
          className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition"
        >
          🔇 Enable sound
        </button>
      )} */}

      <button
        aria-label="Notifications"
        aria-expanded={open}
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

          <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-gray-100 z-30 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="font-bold text-gray-900 text-sm">Notifications</p>
              <button
                onClick={() => {
                  // Inside a click, so this also unlocks audio
                  unlockAudio().then(playAlarm);
                }}
                className="text-xs font-medium text-gray-400 hover:text-gray-700 transition"
              >
                🔊 Test sound
              </button>
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