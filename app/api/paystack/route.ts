import { NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/paystack";
import { createSupabaseAdminClient } from "@/lib/admin";
import { PlanKey } from "@/components/Plan";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const supabase = createSupabaseAdminClient();

  switch (event.event) {
    // The first payment on a new plan — this is what actually turns the
    // plan on. Recurring renewal charges land here too.
    case "charge.success": {
      const data = event.data;
      const vendorId: string | undefined = data.metadata?.vendor_id;
      const planKey: PlanKey | undefined = data.metadata?.plan_key;

      // Renewal charges after the first one won't carry our metadata —
      // match those by the stored customer code instead.
      const vendorFilter = vendorId
        ? { column: "id", value: vendorId }
        : {
            column: "paystack_customer_code",
            value: data.customer.customer_code,
          };

      await supabase.from("invoices").upsert(
        {
          id: data.reference,
          vendor_id:
            vendorId ??
            (
              await supabase
                .from("vendors")
                .select("id")
                .eq(vendorFilter.column, vendorFilter.value)
                .single()
            ).data?.id,
          amount: data.amount / 100,
          status: "paid",
          paid_at: data.paid_at ?? new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      const update: Record<string, unknown> = {
        plan_status: "active",
        paystack_customer_code: data.customer.customer_code,
      };
      if (planKey) update.plan = planKey;

      await supabase
        .from("vendors")
        .update(update)
        .eq(vendorFilter.column, vendorFilter.value);

      break;
    }

    // Paystack finished setting up the recurring subscription — this is
    // where we learn the subscription_code and next renewal date.
    case "subscription.create": {
      const data = event.data;
      await supabase
        .from("vendors")
        .update({
          paystack_subscription_code: data.subscription_code,
          plan_renews_at: data.next_payment_date,
        })
        .eq("paystack_customer_code", data.customer.customer_code);
      break;
    }

    case "subscription.disable":
    case "subscription.not_renew": {
      const data = event.data;
      await supabase
        .from("vendors")
        .update({ plan_status: "cancelled" })
        .eq("paystack_subscription_code", data.subscription_code);
      break;
    }

    case "invoice.payment_failed": {
      const data = event.data;
      await supabase
        .from("vendors")
        .update({ plan_status: "past_due" })
        .eq("paystack_customer_code", data.customer.customer_code);
      break;
    }

    default:
      break;
  }

  // Paystack retries on anything other than a 2xx, so always acknowledge
  // once we've handled (or deliberately ignored) the event.
  return NextResponse.json({ received: true });
}
