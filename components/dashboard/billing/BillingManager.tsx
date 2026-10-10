
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { Dropbox, Wallet2, Calendar, TickCircle } from "iconsax-react";

import {
  type BillingPeriod,
  SUBSCRIPTION_PLANS,
  getBillingPeriodSuffix,
} from "@/components/Plan";

import ChangePlanDialog from "./ChangePlanDialog";
import EmptyState from "@/components/reusuable/EmptyState";

export type Invoice = {
  id: string;
  amount: number;
  status: "paid" | "failed";
  paid_at: string;
};

type Props = {
  billingPeriod: BillingPeriod | null;
  planStatus: string;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  hasPaymentMethod: boolean;
  invoices: Invoice[];
};

const planStatusStyles: Record<string, string> = {
  trial: "bg-blue-50 text-blue-700",
  active: "bg-green-50 text-green-700",
  inactive: "bg-gray-100 text-gray-500",
  expired: "bg-red-50 text-red-700",
  past_due: "bg-yellow-50 text-yellow-700",
  cancelled: "bg-red-50 text-red-700",
};

function formatDate(date: string | null) {
  if (!date) return null;

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function BillingManager({
  billingPeriod,
  planStatus,
  trialEndsAt,
  subscriptionEndsAt,
  hasPaymentMethod,
  invoices,
}: Props) {
  const searchParams = useSearchParams();

  const justPaid = searchParams.get("reference");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const currentPlan = billingPeriod ? SUBSCRIPTION_PLANS[billingPeriod] : null;

  const isTrial = planStatus === "trial";

  const isActive = planStatus === "active";

  const isExpired = planStatus === "expired";

  const currentExpiryDate = isTrial ? trialEndsAt : subscriptionEndsAt;

  async function handleConfirmPlan(selected: BillingPeriod) {
    try {
      setCheckoutError(null);
      setIsCheckingOut(true);

      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          billingPeriod: selected,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Couldn't start checkout.");
      }

      if (!json.url) {
        throw new Error("Checkout URL was not returned.");
      }

      window.location.href = json.url;
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "Couldn't start checkout.",
      );

      setIsCheckingOut(false);
    }
  }

  return (
    <div>
      {/* PAGE TITLE */}

      <h1 className="mb-1 text-2xl font-bold text-gray-900">Billing</h1>

      <p className="mb-8 text-sm text-gray-500">
        Manage your subscription, billing period and payment history.
      </p>

      {/* PAYMENT RETURN MESSAGE */}

      {justPaid && (
        <div className="mb-6 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Payment received. Your subscription will update once the payment has
          been verified.
        </div>
      )}

      {/* CHECKOUT ERROR */}

      {checkoutError && (
        <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {checkoutError}
        </div>
      )}

      {/* CURRENT SUBSCRIPTION */}

      <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <Wallet2 size={22} color="currentColor" variant="Bold" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-gray-900">
                {isTrial
                  ? "14-Day Free Trial"
                  : currentPlan
                    ? `${currentPlan.name} Subscription`
                    : "No active subscription"}
              </p>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  planStatusStyles[planStatus] ?? planStatusStyles.inactive
                }`}
              >
                {formatStatus(planStatus)}
              </span>
            </div>

            {/* TRIAL */}

            {isTrial && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-500">
                  Full access to all Bukka features during your free trial.
                </p>

                {trialEndsAt && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Calendar size={15} color="currentColor" />
                    Trial ends {formatDate(trialEndsAt)}
                  </div>
                )}
              </div>
            )}

            {/* ACTIVE PAID SUBSCRIPTION */}

            {isActive && currentPlan && billingPeriod && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-500">
                  ₦{currentPlan.price.toLocaleString()}{" "}
                  {getBillingPeriodSuffix(billingPeriod)}
                </p>

                {subscriptionEndsAt && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Calendar size={15} color="currentColor" />
                    Access until {formatDate(subscriptionEndsAt)}
                  </div>
                )}
              </div>
            )}

            {/* EXPIRED */}

            {isExpired && (
              <p className="mt-2 text-sm text-red-600">
                Your subscription has expired. Renew to continue managing your
                menu.
              </p>
            )}

            {/* OTHER INACTIVE STATES */}

            {!isTrial && !isActive && !isExpired && !currentPlan && (
              <p className="mt-2 text-sm text-gray-500">
                Choose a billing period to continue using Bukka after your
                trial.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-900 transition hover:border-green-600 hover:text-green-700"
        >
          {isTrial
            ? "Choose subscription"
            : isExpired
              ? "Renew subscription"
              : "Change billing period"}
        </button>
      </div>

      {/* SUBSCRIPTION FEATURES */}

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <TickCircle size={20} color="currentColor" variant="Bold" />
          </div>

          <div>
            <p className="font-bold text-gray-900">Everything included</p>

            <p className="mt-1 text-sm text-gray-500">
              All paid billing periods include the same Bukka features.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
          <p>✓ Digital menu</p>
          <p>✓ Unlimited menu items</p>
          <p>✓ QR code</p>
          <p>✓ Shareable menu link</p>
          <p>✓ WhatsApp ordering</p>
          <p>✓ Order management</p>
          <p>✓ Order history</p>
          <p>✓ Business analytics</p>
        </div>
      </div>

      {/* PAYMENT METHOD */}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <p className="font-bold text-gray-900">Payment method</p>

          <p className="mt-1 text-sm text-gray-500">
            {hasPaymentMethod
              ? "Your payment details are securely managed by Paystack."
              : "Your payment method will be added automatically when you make your first payment."}
          </p>
        </div>
      </div>

      {/* BILLING HISTORY */}

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="font-bold text-gray-900">Billing history</h2>
        </div>

        {invoices.length === 0 ? (
          <div className="bg-white">
            <EmptyState
              icon={<Dropbox size={28} color="#16A34A" />}
              title="No payments yet"
              description="Your payment history will appear here after you make your first subscription payment."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Date</th>

                  <th className="px-6 py-3 font-medium">Reference</th>

                  <th className="px-6 py-3 font-medium">Amount</th>

                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(invoice.paid_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-gray-400">
                      {invoice.id}
                    </td>

                    <td className="px-6 py-4 text-gray-900">
                      ₦{Number(invoice.amount).toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          invoice.status === "paid"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {invoice.status === "paid" ? "Paid" : "Failed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BILLING PERIOD DIALOG */}

      <ChangePlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentBillingPeriod={billingPeriod}
        onConfirm={handleConfirmPlan}
        loading={isCheckingOut}
      />
    </div>
  );
}