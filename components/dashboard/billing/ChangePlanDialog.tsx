"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export type PlanName = "Starter" | "Growth" | "Business";

const plans: { name: PlanName; price: number; description: string }[] = [
  { name: "Starter", price: 5000, description: "Up to 30 menu items." },
  {
    name: "Growth",
    price: 12000,
    description: "Unlimited items + analytics.",
  },
  { name: "Business", price: 25000, description: "Up to 5 outlets." },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: PlanName;
  onSelectPlan: (plan: PlanName) => void;
};

export default function ChangePlanDialog({
  open,
  onOpenChange,
  currentPlan,
  onSelectPlan,
}: Props) {
  const [selected, setSelected] = useState<PlanName>(currentPlan);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Change plan</DialogTitle>
        </DialogHeader>

        <div className="grid sm:grid-cols-3 gap-3 mt-2">
          {plans.map((plan) => {
            const isSelected = selected === plan.name;
            return (
              <button
                key={plan.name}
                type="button"
                onClick={() => setSelected(plan.name)}
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
                <p className="mt-1 text-xs text-gray-500">{plan.description}</p>
              </button>
            );
          })}
        </div>

        <DialogFooter className="mt-6">
          <button
            onClick={() => onOpenChange(false)}
            className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSelectPlan(selected);
              onOpenChange(false);
            }}
            disabled={selected === currentPlan}
            className="bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Confirm change
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
