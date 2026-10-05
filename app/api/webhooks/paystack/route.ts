import { NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/paystack";
import { createSupabaseAdminClient } from "@/lib/admin";
import { PlanKey } from "@/components/Plan";

function addOneMonth(date: Date) {
  const result = new Date(date);

  const originalDay = result.getUTCDate();

  // Move to first day to avoid month overflow issues
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + 1);

  // Get last day of target month
  const lastDayOfTargetMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();

  result.setUTCDate(Math.min(originalDay, lastDayOfTargetMonth));

  return result;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    console.error("Paystack webhook: signature verification failed.");

    return NextResponse.json(
      {
        error: "Invalid signature.",
      },
      {
        status: 401,
      },
    );
  }

  const event = JSON.parse(rawBody);

  console.log("Paystack webhook event:", event.event);

  const supabase = createSupabaseAdminClient();

  let hadError = false;

  switch (event.event) {
    /*
     * Successful initial payment and successful
     * recurring subscription payments.
     */
    case "charge.success": {
      const data = event.data;

      const metadataVendorId: string | undefined = data.metadata?.vendor_id;

      const planKey: PlanKey | undefined = data.metadata?.plan_key;

      let vendorId = metadataVendorId;

      /*
       * Recurring subscription charges may not
       * include the metadata from the original
       * transaction.
       *
       * In that situation find the vendor by
       * Paystack customer code.
       */
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

      /*
       * Use Paystack's actual successful payment
       * time as the beginning of the paid period.
       */
      const paidAt = new Date(
        data.paid_at ?? data.paidAt ?? new Date().toISOString(),
      );

      /*
       * Monthly subscription:
       * next renewal = one calendar month after
       * successful payment.
       */
      const renewsAt = addOneMonth(paidAt);

      console.log("Payment date:", paidAt.toISOString());

      console.log("Calculated renewal date:", renewsAt.toISOString());

      /*
       * Store payment invoice.
       */
      const { error: invoiceError } = await supabase.from("invoices").upsert(
        {
          id: data.reference,

          vendor_id: vendorId,

          amount: data.amount / 100,

          status: "paid",

          paid_at: paidAt.toISOString(),
        },
        {
          onConflict: "id",
        },
      );

      if (invoiceError) {
        console.error(
          "Paystack webhook: invoice upsert failed:",
          invoiceError.message,
        );

        hadError = true;
      }

      /*
       * Activate the plan and establish the
       * new paid-through date.
       */
      const update: Record<string, unknown> = {
        plan_status: "active",

        paystack_customer_code: data.customer.customer_code,

        plan_renews_at: renewsAt.toISOString(),
      };

      if (planKey) {
        update.plan = planKey;
      }

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

    /*
     * Subscription creation.
     *
     * Store the subscription code, but don't
     * overwrite plan_renews_at with an earlier
     * Paystack date.
     */
    case "subscription.create": {
      const data = event.data;

      console.log("Paystack subscription created:", {
        subscription_code: data.subscription_code,

        next_payment_date: data.next_payment_date,

        customer_code: data.customer?.customer_code,
      });

      const customerCode = data.customer?.customer_code;

      if (!customerCode) {
        console.error(
          "Paystack webhook: subscription.create has no customer code.",
        );

        hadError = true;
        break;
      }

      /*
       * Get the vendor's existing renewal date.
       */
      const { data: vendor, error: lookupError } = await supabase
        .from("vendors")
        .select("id, plan_renews_at")
        .eq("paystack_customer_code", customerCode)
        .single();

      if (lookupError || !vendor) {
        console.error(
          "Paystack webhook: couldn't resolve vendor during subscription.create:",
          lookupError?.message,
        );

        hadError = true;
        break;
      }

      const update: Record<string, unknown> = {
        paystack_subscription_code: data.subscription_code,
      };

      /*
       * Only use Paystack's next_payment_date
       * if we do not already have a paid-through
       * date.
       */
      if (!vendor.plan_renews_at && data.next_payment_date) {
        update.plan_renews_at = data.next_payment_date;
      }

      const { error } = await supabase
        .from("vendors")
        .update(update)
        .eq("id", vendor.id);

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
        .update({
          plan_status: "cancelled",
        })
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
        .update({
          plan_status: "past_due",
        })
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

  if (hadError) {
    return NextResponse.json(
      {
        received: true,
        error: "Processing error — see server logs.",
      },
      {
        status: 500,
      },
    );
  }

  return NextResponse.json({
    received: true,
  });
}
