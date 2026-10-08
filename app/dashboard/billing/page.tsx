import { Suspense } from "react";
import { redirect } from "next/navigation";

import BillingManager, {
  type Invoice,
} from "@/components/dashboard/billing/BillingManager";

import { createSupabaseServerClient } from "@/lib/server";

import type { BillingPeriod } from "@/components/Plan";

export default async function BillingPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: vendor, error: vendorError }, { data: invoices }] =
    await Promise.all([
      supabase
        .from("vendors")
        .select(
          `
          billing_period,
          plan_status,
          trial_ends_at,
          subscription_ends_at,
          paystack_customer_code
        `,
        )
        .eq("id", user.id)
        .single(),

      supabase
        .from("invoices")
        .select(
          `
          id,
          amount,
          status,
          paid_at
        `,
        )
        .eq("vendor_id", user.id)
        .order("paid_at", {
          ascending: false,
        }),
    ]);

  if (vendorError || !vendor) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={null}>
      <BillingManager
        billingPeriod={(vendor.billing_period as BillingPeriod | null) ?? null}
        planStatus={vendor.plan_status ?? "inactive"}
        trialEndsAt={vendor.trial_ends_at ?? null}
        subscriptionEndsAt={vendor.subscription_ends_at ?? null}
        hasPaymentMethod={Boolean(vendor.paystack_customer_code)}
        invoices={(invoices as Invoice[]) ?? []}
      />
    </Suspense>
  );
}
