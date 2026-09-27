import { NextResponse } from "next/server";
import { initializeTransaction } from "@/lib/paystack";
// import { PLANS, type PlanKey } from "@/lib/Plan";
import { createSupabaseServerClient } from "@/lib/server";
import { PlanKey, PLANS } from "@/components/Plan";

// Plan codes are created once in the Paystack dashboard (or via their API)
// and are account-specific, so they live in env vars rather than in code.
const PAYSTACK_PLAN_CODES: Record<PlanKey, string | undefined> = {
  starter: process.env.PAYSTACK_PLAN_STARTER,
  growth: process.env.PAYSTACK_PLAN_GROWTH,
  business: process.env.PAYSTACK_PLAN_BUSINESS,
};

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const plan = body?.plan as PlanKey | undefined;

  if (!plan || !(plan in PLANS)) {
    return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  }

  const planCode = PAYSTACK_PLAN_CODES[plan];

  if (!planCode) {
    return NextResponse.json(
      {
        error: `${PLANS[plan].name} isn't configured for payment yet. Set PAYSTACK_PLAN_${plan.toUpperCase()} in your environment.`,
      },
      { status: 500 },
    );
  }

  const origin = new URL(request.url).origin;

  try {
    const { authorization_url } = await initializeTransaction({
      email: user.email,
      amountKobo: PLANS[plan].price * 100,
      planCode,
      callbackUrl: `${origin}/dashboard/billing`,
      metadata: {
        vendor_id: user.id,
        plan_key: plan,
      },
    });

    return NextResponse.json({ url: authorization_url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Payment setup failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
