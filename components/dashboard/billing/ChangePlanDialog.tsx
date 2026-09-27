"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PLANS, PLAN_ORDER, type PlanKey } from "@/components/Plan";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: PlanKey;
  onConfirm: (plan: PlanKey) => Promise<void>;
};

export default function ChangePlanDialog({
  open,
  onOpenChange,
  currentPlan,
  onConfirm,
}: Props) {
  const [selected, setSelected] = useState<PlanKey>(currentPlan);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);

    try {
      await onConfirm(selected);
      // On success the browser navigates away to Paystack's checkout —
      // nothing left to do here.
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Couldn't start checkout.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Change plan</DialogTitle>
        </DialogHeader>

        <div className="grid sm:grid-cols-3 gap-3 mt-2">
          {PLAN_ORDER.map((key) => {
            const plan = PLANS[key];
            const isSelected = selected === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                className={`text-left rounded-2xl border p-4 transition ${
                  isSelected
                    ? "border-green-600 ring-2 ring-green-100 bg-green-50/40"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-bold text-gray-900">{plan.name}</p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  ₦{plan.price.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500">/mo</span>
                </p>
              </button>
            );
          })}
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <p className="mt-3 text-xs text-gray-400">
          You&rsquo;ll be taken to Paystack to complete payment securely. Your
          plan updates once payment is confirmed.
        </p>

        <DialogFooter className="mt-4">
          <button
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting || selected === currentPlan}
            className="bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting ? "Redirecting…" : "Continue to payment"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
