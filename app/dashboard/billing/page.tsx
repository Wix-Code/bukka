import { Suspense } from "react";
import { redirect } from "next/navigation";
import BillingManager, {
  type Invoice,
} from "@/components/dashboard/billing/BillingManager";
// import type { PlanKey } from "@/lib/plan";
import { createSupabaseServerClient } from "@/lib/server";
import { PlanKey } from "@/components/Plan";

export default async function BillingPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: vendor }, { data: invoices }] = await Promise.all([
    supabase
      .from("vendors")
      .select("plan, plan_status, plan_renews_at, paystack_customer_code")
      .eq("id", user.id)
      .single(),
    supabase
      .from("invoices")
      .select("id, amount, status, paid_at")
      .eq("vendor_id", user.id)
      .order("paid_at", { ascending: false }),
  ]);

  return (
    <Suspense fallback={null}>
      <BillingManager
        plan={(vendor?.plan as PlanKey) ?? "starter"}
        planStatus={vendor?.plan_status ?? "inactive"}
        planRenewsAt={vendor?.plan_renews_at ?? null}
        hasPaymentMethod={Boolean(vendor?.paystack_customer_code)}
        invoices={(invoices as Invoice[]) ?? []}
      />
    </Suspense>
  );
}
