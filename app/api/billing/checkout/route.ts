// import { NextResponse } from "next/server";

// import { initializeTransaction } from "@/lib/paystack";
// import { createSupabaseServerClient } from "@/lib/server";

// import { type BillingPeriod, SUBSCRIPTION_PLANS } from "@/components/Plan";

// const VALID_BILLING_PERIODS: BillingPeriod[] = [
//   "monthly",
//   "half_year",
//   "annual",
// ];

// function isBillingPeriod(value: unknown): value is BillingPeriod {
//   return (
//     typeof value === "string" &&
//     VALID_BILLING_PERIODS.includes(value as BillingPeriod)
//   );
// }

// export async function POST(request: Request) {
//   try {
//     const supabase = await createSupabaseServerClient();

//     const {
//       data: { user },
//     } = await supabase.auth.getUser();

//     if (!user || !user.email) {
//       return NextResponse.json(
//         {
//           error: "Not signed in.",
//         },
//         {
//           status: 401,
//         },
//       );
//     }

//     const body = await request.json().catch(() => null);

//     const billingPeriod = body?.billingPeriod;

//     if (!isBillingPeriod(billingPeriod)) {
//       return NextResponse.json(
//         {
//           error: "Invalid billing period.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     const subscription = SUBSCRIPTION_PLANS[billingPeriod];

//     const amountKobo = subscription.price * 100;

//     const origin = new URL(request.url).origin;

//     const { authorization_url } = await initializeTransaction({
//       email: user.email,
//       amountKobo,
//       callbackUrl: `${origin}/dashboard/billing`,
//       metadata: {
//         vendor_id: user.id,
//         billing_period: billingPeriod,
//       },
//     });

//     return NextResponse.json({
//       url: authorization_url,
//     });
//   } catch (error) {
//     console.error("Checkout route error:", error);

//     return NextResponse.json(
//       {
//         error: error instanceof Error ? error.message : "Payment setup failed.",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

import { NextResponse } from "next/server";

import { initializeTransaction } from "@/lib/paystack";
import { createSupabaseServerClient } from "@/lib/server";

import { type BillingPeriod, SUBSCRIPTION_PLANS } from "@/components/Plan";

const PAYSTACK_PLAN_CODES: Record<BillingPeriod, string | undefined> = {
  monthly: process.env.PAYSTACK_PLAN_MONTHLY,
  half_year: process.env.PAYSTACK_PLAN_HALF_YEAR,
  annual: process.env.PAYSTACK_PLAN_ANNUAL,
};

const VALID_BILLING_PERIODS: BillingPeriod[] = [
  "monthly",
  "half_year",
  "annual",
];

function isBillingPeriod(value: unknown): value is BillingPeriod {
  return (
    typeof value === "string" &&
    VALID_BILLING_PERIODS.includes(value as BillingPeriod)
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        {
          error: "Not signed in.",
        },
        {
          status: 401,
        },
      );
    }

    const body = await request.json().catch(() => null);

    const billingPeriod = body?.billingPeriod;

    if (!isBillingPeriod(billingPeriod)) {
      return NextResponse.json(
        {
          error: "Invalid billing period.",
        },
        {
          status: 400,
        },
      );
    }

    const subscription = SUBSCRIPTION_PLANS[billingPeriod];

    const planCode = PAYSTACK_PLAN_CODES[billingPeriod];

    if (!planCode) {
      return NextResponse.json(
        {
          error: "This billing option is not configured in Paystack.",
        },
        {
          status: 500,
        },
      );
    }

    const amountKobo = subscription.price * 100;

    const origin = new URL(request.url).origin;

    const { authorization_url } = await initializeTransaction({
      email: user.email,
      amountKobo,
      planCode,
      callbackUrl: `${origin}/dashboard/billing`,
      metadata: {
        vendor_id: user.id,
        billing_period: billingPeriod,
      },
    });

    return NextResponse.json({
      url: authorization_url,
    });
  } catch (error) {
    console.error("Checkout initialization failed:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Payment setup failed.",
      },
      {
        status: 500,
      },
    );
  }
}