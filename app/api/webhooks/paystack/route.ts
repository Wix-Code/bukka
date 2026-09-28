// import { NextResponse } from "next/server";
// import { verifyPaystackSignature } from "@/lib/paystack";
// import { createSupabaseAdminClient } from "@/lib/admin";
// import { PlanKey } from "@/components/Plan";

// export async function POST(request: Request) {
//   const rawBody = await request.text();
//   const signature = request.headers.get("x-paystack-signature");

//   if (!verifyPaystackSignature(rawBody, signature)) {
//     return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
//   }

//   const event = JSON.parse(rawBody);
//   const supabase = createSupabaseAdminClient();

//   switch (event.event) {
//     // The first payment on a new plan — this is what actually turns the
//     // plan on. Recurring renewal charges land here too.
//     case "charge.success": {
//       const data = event.data;
//       const vendorId: string | undefined = data.metadata?.vendor_id;
//       const planKey: PlanKey | undefined = data.metadata?.plan_key;

//       // Renewal charges after the first one won't carry our metadata —
//       // match those by the stored customer code instead.
//       const vendorFilter = vendorId
//         ? { column: "id", value: vendorId }
//         : {
//             column: "paystack_customer_code",
//             value: data.customer.customer_code,
//           };

//       await supabase.from("invoices").upsert(
//         {
//           id: data.reference,
//           vendor_id:
//             vendorId ??
//             (
//               await supabase
//                 .from("vendors")
//                 .select("id")
//                 .eq(vendorFilter.column, vendorFilter.value)
//                 .single()
//             ).data?.id,
//           amount: data.amount / 100,
//           status: "paid",
//           paid_at: data.paid_at ?? new Date().toISOString(),
//         },
//         { onConflict: "id" },
//       );

//       const update: Record<string, unknown> = {
//         plan_status: "active",
//         paystack_customer_code: data.customer.customer_code,
//       };
//       if (planKey) update.plan = planKey;

//       await supabase
//         .from("vendors")
//         .update(update)
//         .eq(vendorFilter.column, vendorFilter.value);

//       break;
//     }

//     // Paystack finished setting up the recurring subscription — this is
//     // where we learn the subscription_code and next renewal date.
//     case "subscription.create": {
//       const data = event.data;
//       await supabase
//         .from("vendors")
//         .update({
//           paystack_subscription_code: data.subscription_code,
//           plan_renews_at: data.next_payment_date,
//         })
//         .eq("paystack_customer_code", data.customer.customer_code);
//       break;
//     }

//     case "subscription.disable":
//     case "subscription.not_renew": {
//       const data = event.data;
//       await supabase
//         .from("vendors")
//         .update({ plan_status: "cancelled" })
//         .eq("paystack_subscription_code", data.subscription_code);
//       break;
//     }

//     case "invoice.payment_failed": {
//       const data = event.data;
//       await supabase
//         .from("vendors")
//         .update({ plan_status: "past_due" })
//         .eq("paystack_customer_code", data.customer.customer_code);
//       break;
//     }

//     default:
//       break;
//   }

//   // Paystack retries on anything other than a 2xx, so always acknowledge
//   // once we've handled (or deliberately ignored) the event.
//   return NextResponse.json({ received: true });
// }

import { NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/paystack";
import { createSupabaseAdminClient } from "@/lib/admin";
import { PlanKey } from "@/components/Plan";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    console.error("Paystack webhook: signature verification failed.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const supabase = createSupabaseAdminClient();
  let hadError = false;

  switch (event.event) {
    // The first payment on a new plan — this is what actually turns the
    // plan on. Recurring renewal charges land here too.
    case "charge.success": {
      const data = event.data;
      const metadataVendorId: string | undefined = data.metadata?.vendor_id;
      const planKey: PlanKey | undefined = data.metadata?.plan_key;

      let vendorId = metadataVendorId;

      // Renewal charges after the very first one won't carry our metadata —
      // match those by the customer code we stored on the first payment.
      if (!vendorId) {
        const { data: match, error: lookupError } = await supabase
          .from("vendors")
          .select("id")
          .eq("paystack_customer_code", data.customer.customer_code)
          .single();

        if (lookupError) {
          console.error(
            "Paystack webhook: couldn't find vendor by customer_code:",
            lookupError.message,
          );
          hadError = true;
        }
        vendorId = match?.id;
      }

      if (!vendorId) {
        console.error(
          "Paystack webhook: no vendor resolved for charge",
          data.reference,
        );
        hadError = true;
        break;
      }

      const { error: invoiceError } = await supabase.from("invoices").upsert(
        {
          id: data.reference,
          vendor_id: vendorId,
          amount: data.amount / 100,
          status: "paid",
          paid_at: data.paid_at ?? new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (invoiceError) {
        console.error(
          "Paystack webhook: invoice upsert failed:",
          invoiceError.message,
        );
        hadError = true;
      }

      const update: Record<string, unknown> = {
        plan_status: "active",
        paystack_customer_code: data.customer.customer_code,
      };
      if (planKey) update.plan = planKey;

      const { error: vendorUpdateError } = await supabase
        .from("vendors")
        .update(update)
        .eq("id", vendorId);

      if (vendorUpdateError) {
        console.error(
          "Paystack webhook: vendor plan update failed:",
          vendorUpdateError.message,
        );
        hadError = true;
      }

      break;
    }

    // Paystack finished setting up the recurring subscription — this is
    // where we learn the subscription_code and next renewal date.
    case "subscription.create": {
      const data = event.data;
      const { error } = await supabase
        .from("vendors")
        .update({
          paystack_subscription_code: data.subscription_code,
          plan_renews_at: data.next_payment_date,
        })
        .eq("paystack_customer_code", data.customer.customer_code);

      if (error) {
        console.error(
          "Paystack webhook: subscription.create update failed:",
          error.message,
        );
        hadError = true;
      }
      break;
    }

    case "subscription.disable":
    case "subscription.not_renew": {
      const data = event.data;
      const { error } = await supabase
        .from("vendors")
        .update({ plan_status: "cancelled" })
        .eq("paystack_subscription_code", data.subscription_code);

      if (error) {
        console.error(
          "Paystack webhook: subscription cancel update failed:",
          error.message,
        );
        hadError = true;
      }
      break;
    }

    case "invoice.payment_failed": {
      const data = event.data;
      const { error } = await supabase
        .from("vendors")
        .update({ plan_status: "past_due" })
        .eq("paystack_customer_code", data.customer.customer_code);

      if (error) {
        console.error(
          "Paystack webhook: payment_failed update failed:",
          error.message,
        );
        hadError = true;
      }
      break;
    }

    default:
      console.log("Paystack webhook: unhandled event type:", event.event);
      break;
  }

  // A non-2xx response tells Paystack to retry delivery later. Worth doing
  // when our own database write failed — the payment itself still went
  // through and shouldn't be silently lost because our side had a bug.
  if (hadError) {
    return NextResponse.json(
      { received: true, error: "Processing error — see server logs." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}