"use client";

import { useState } from "react";
import { Wallet2 } from "iconsax-react";
import ChangePlanDialog, {
  type PlanName,
} from "@/components/dashboard/billing/ChangePlanDialog";

const planPrices: Record<PlanName, number> = {
  Starter: 5000,
  Growth: 12000,
  Business: 25000,
};

const invoices = [
  {
    date: "Sep 26, 2026",
    description: "Growth plan — monthly",
    amount: 12000,
    status: "Paid",
  },
  {
    date: "Aug 26, 2026",
    description: "Growth plan — monthly",
    amount: 12000,
    status: "Paid",
  },
  {
    date: "Jul 26, 2026",
    description: "Starter plan — monthly",
    amount: 5000,
    status: "Paid",
  },
];

export default function BillingPage() {
  const [plan, setPlan] = useState<PlanName>("Growth");
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Billing</h1>
      <p className="text-sm text-gray-500 mb-8">
        Manage your subscription and payment details.
      </p>

      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <Wallet2 size={22} color="currentColor" variant="Bold" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{plan} plan</p>
            <p className="text-sm text-gray-500">
              ₦{planPrices[plan].toLocaleString()}/mo · Renews Oct 26, 2026
            </p>
          </div>
        </div>

        <button
          onClick={() => setDialogOpen(true)}
          className="border border-gray-200 px-5 py-2.5 rounded-full text-sm font-medium text-gray-900 hover:border-gray-300 transition"
        >
          Change plan
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-bold text-gray-900">Payment method</p>
          <p className="text-sm text-gray-500 mt-1">Visa ending in 4242</p>
        </div>

        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
          Coming soon
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm mt-6 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Billing history</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((invoice, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 text-gray-600">{invoice.date}</td>
                  <td className="px-6 py-4 text-gray-900">
                    {invoice.description}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    ₦{invoice.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ChangePlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentPlan={plan}
        onSelectPlan={setPlan}
      />
    </div>
  );
}
