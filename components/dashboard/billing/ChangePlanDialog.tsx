"use client";

import { useEffect, useState } from "react";

import {
  type BillingPeriod,
  PLAN_ORDER,
  SUBSCRIPTION_PLANS,
  getBillingPeriodSuffix,
} from "@/components/Plan";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Check } from "lucide-react";

type Props = {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  currentBillingPeriod: BillingPeriod | null;

  onConfirm: (selected: BillingPeriod) => Promise<void>;

  loading?: boolean;
};

export default function ChangePlanDialog({
  open,
  onOpenChange,
  currentBillingPeriod,
  onConfirm,
  loading = false,
}: Props) {
  const [selected, setSelected] = useState<BillingPeriod | null>(
    currentBillingPeriod,
  );

  const [error, setError] = useState<string | null>(null);

  /*
   * Reset selected option whenever
   * the dialog is opened.
   */
  useEffect(() => {
    if (open) {
      setSelected(currentBillingPeriod);
      setError(null);
    }
  }, [open, currentBillingPeriod]);

  async function handleContinue() {
    if (!selected) {
      setError("Please select a billing period.");

      return;
    }

    if (selected === currentBillingPeriod) {
      setError("Please select a different billing period.");

      return;
    }

    try {
      setError(null);

      /*
       * This is the ONLY place where
       * checkout is started.
       */
      await onConfirm(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start checkout.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choose your billing period</DialogTitle>

          <DialogDescription>
            Every Bukka subscription includes the same features. Select the
            billing period that works best for you.
          </DialogDescription>
        </DialogHeader>

        {/* OPTIONS */}

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {PLAN_ORDER.map((billingPeriod) => {
            const plan = SUBSCRIPTION_PLANS[billingPeriod];

            const isCurrent = currentBillingPeriod === billingPeriod;

            const isSelected = selected === billingPeriod;

            const savings =
              billingPeriod === "half_year"
                ? 2000 * 6 - plan.price
                : billingPeriod === "annual"
                  ? 2000 * 12 - plan.price
                  : 0;

            return (
              <button
                key={billingPeriod}
                type="button"
                /*
                 * IMPORTANT:
                 * Clicking a card only selects it.
                 *
                 * It does NOT redirect.
                 */
                onClick={() => {
                  if (!isCurrent && !loading) {
                    setSelected(billingPeriod);

                    setError(null);
                  }
                }}
                disabled={loading || isCurrent}
                className={`
                    relative rounded-2xl border p-5 text-left transition
                    ${
                      isSelected && !isCurrent
                        ? "border-green-600 bg-green-50/40 ring-2 ring-green-100"
                        : isCurrent
                          ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
                          : "border-gray-200 hover:border-green-400"
                    }
                  `}
              >
                {/* BADGE */}

                {plan.badge && (
                  <span className="mb-3 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    {plan.badge}
                  </span>
                )}

                {/* SELECTED CHECK */}

                {isSelected && !isCurrent && (
                  <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white">
                    <Check size={15} strokeWidth={3} />
                  </div>
                )}

                <h3 className="font-bold text-gray-900">{plan.name}</h3>

                <p className="mt-1 text-sm leading-5 text-gray-500">
                  {plan.description}
                </p>

                <div className="mt-5">
                  <span className="text-2xl font-bold text-gray-900">
                    ₦{plan.price.toLocaleString()}
                  </span>

                  <span className="ml-1 text-sm text-gray-500">
                    {getBillingPeriodSuffix(billingPeriod)}
                  </span>
                </div>

                {savings > 0 && (
                  <p className="mt-2 text-xs font-medium text-green-600">
                    Save ₦{savings.toLocaleString()}
                  </p>
                )}

                <div className="mt-5 flex items-center gap-2 text-sm text-gray-600">
                  <Check size={16} className="text-green-600" />
                  Full access
                </div>

                <div className="mt-5">
                  <span
                    className={`
                        block rounded-full py-2.5 text-center text-sm font-medium
                        ${
                          isCurrent
                            ? "bg-gray-100 text-gray-500"
                            : isSelected
                              ? "bg-green-600 text-white"
                              : "border border-gray-200 text-gray-900"
                        }
                      `}
                  >
                    {isCurrent
                      ? "Current billing period"
                      : isSelected
                        ? "Selected"
                        : "Select"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-3 rounded-xl bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-500">
          Select a billing period first. You will only be redirected to Paystack
          after clicking Continue to payment.
        </div>

        {/* ACTION BUTTONS */}

        <DialogFooter className="mt-5 gap-2 sm:gap-0">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={loading || !selected || selected === currentBillingPeriod}
            className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Redirecting..." : "Continue to payment"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
