// import { createSupabaseServerClient } from "@/lib/server";
// import { NextResponse } from "next/server";

// export async function GET() {
//   const supabase = await createSupabaseServerClient();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     return NextResponse.json({ error: "Not signed in." }, { status: 401 });
//   }

//   const [
//     { data: orders, error: ordersError },
//     { data: vendor, error: vendorError },
//   ] = await Promise.all([
//     supabase
//       .from("orders")
//       .select("id, item_name, item_price, status, created_at")
//       .eq("vendor_id", user.id)
//       .order("created_at", { ascending: false })
//       .limit(20),
//     supabase
//       .from("vendors")
//       .select("notifications_last_seen_at")
//       .eq("id", user.id)
//       .single(),
//   ]);

//   if (ordersError || vendorError) {
//     return NextResponse.json(
//       { error: (ordersError ?? vendorError)?.message },
//       { status: 500 },
//     );
//   }

//   return NextResponse.json({
//     orders: orders ?? [],
//     lastSeenAt: vendor?.notifications_last_seen_at ?? null,
//   });
// }

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const [
    { data: orders, error: ordersError },
    { data: vendor, error: vendorError },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id, item_name, item_price, status, created_at")
      .eq("vendor_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("vendors")
      .select("notifications_last_seen_at")
      .eq("id", user.id)
      .single(),
  ]);

  if (ordersError || vendorError) {
    return NextResponse.json(
      { error: (ordersError ?? vendorError)?.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    orders: orders ?? [],
    lastSeenAt: vendor?.notifications_last_seen_at ?? null,
  });
}