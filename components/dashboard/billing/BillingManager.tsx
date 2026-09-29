// "use client";

// import { useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { Wallet2 } from "iconsax-react";
// import ChangePlanDialog from "./ChangePlanDialog";
// import { PlanKey, PLANS } from "@/components/Plan";

// export type Invoice = {
//   id: string;
//   amount: number;
//   status: "paid" | "failed";
//   paid_at: string;
// };

// type Props = {
//   plan: PlanKey;
//   planStatus: string;
//   planRenewsAt: string | null;
//   hasPaymentMethod: boolean;
//   invoices: Invoice[];
// };

// const planStatusStyles: Record<string, string> = {
//   active: "bg-green-50 text-green-700",
//   inactive: "bg-gray-100 text-gray-500",
//   past_due: "bg-yellow-50 text-yellow-700",
//   cancelled: "bg-red-50 text-red-700",
// };

// export default function BillingManager({
//   plan,
//   planStatus,
//   planRenewsAt,
//   hasPaymentMethod,
//   invoices,
// }: Props) {
//   const searchParams = useSearchParams();
//   const justPaid = searchParams.get("reference");
//   const [dialogOpen, setDialogOpen] = useState(false);

//   async function handleConfirmPlan(selected: PlanKey) {
//     const res = await fetch("/api/billing/checkout", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ plan: selected }),
//     });

//     const json = await res.json();

//     if (!res.ok) {
//       throw new Error(json.error || "Couldn't start checkout.");
//     }

//     window.location.href = json.url;
//   }

//   return (
//     <div>
//       <h1 className="text-2xl font-bold text-gray-900 mb-1">Billing</h1>
//       <p className="text-sm text-gray-500 mb-8">
//         Manage your subscription and payment details.
//       </p>

//       {justPaid && (
//         <div className="mb-6 rounded-2xl bg-green-50 text-green-700 text-sm px-4 py-3">
//           Payment received — this can take a minute to reflect below. Refresh if
//           your plan doesn&rsquo;t update right away.
//         </div>
//       )}

//       <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-wrap items-center justify-between gap-4">
//         <div className="flex items-center gap-4">
//           <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
//             <Wallet2 size={22} color="currentColor" variant="Bold" />
//           </div>
//           <div>
//             <div className="flex items-center gap-2">
//               <p className="font-bold text-gray-900">{PLANS[plan].name} plan</p>
//               <span
//                 className={`text-xs font-medium px-2 py-0.5 rounded-full ${
//                   planStatusStyles[planStatus] ?? planStatusStyles.inactive
//                 }`}
//               >
//                 {planStatus.replace("_", " ")}
//               </span>
//             </div>
//             <p className="text-sm text-gray-500">
//               ₦{PLANS[plan].price.toLocaleString()}/mo
//               {planRenewsAt &&
//                 ` · Renews ${new Date(planRenewsAt).toLocaleDateString(
//                   "en-NG",
//                   { day: "numeric", month: "long", year: "numeric" },
//                 )}`}
//             </p>
//           </div>
//         </div>

//         <button
//           onClick={() => setDialogOpen(true)}
//           className="border border-gray-200 px-5 py-2.5 rounded-full text-sm font-medium text-gray-900 hover:border-gray-300 transition"
//         >
//           Change plan
//         </button>
//       </div>

//       <div className="bg-white rounded-2xl shadow-sm p-6 mt-6 flex flex-wrap items-center justify-between gap-4">
//         <div>
//           <p className="font-bold text-gray-900">Payment method</p>
//           <p className="text-sm text-gray-500 mt-1">
//             {hasPaymentMethod
//               ? "Your card is saved securely with Paystack."
//               : "Added automatically on your first payment."}
//           </p>
//         </div>
//       </div>

//       <div className="bg-white rounded-2xl shadow-sm mt-6 overflow-hidden">
//         <div className="px-6 py-5 border-b border-gray-100">
//           <h2 className="font-bold text-gray-900">Billing history</h2>
//         </div>

//         {invoices.length === 0 ? (
//           <div className="p-12 text-center text-gray-500">No payments yet.</div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="text-left text-gray-500">
//                   <th className="px-6 py-3 font-medium">Date</th>
//                   <th className="px-6 py-3 font-medium">Reference</th>
//                   <th className="px-6 py-3 font-medium">Amount</th>
//                   <th className="px-6 py-3 font-medium">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {invoices.map((invoice) => (
//                   <tr key={invoice.id}>
//                     <td className="px-6 py-4 text-gray-600">
//                       {new Date(invoice.paid_at).toLocaleDateString("en-NG", {
//                         day: "numeric",
//                         month: "short",
//                         year: "numeric",
//                       })}
//                     </td>
//                     <td className="px-6 py-4 text-gray-400 font-mono text-xs">
//                       {invoice.id}
//                     </td>
//                     <td className="px-6 py-4 text-gray-900">
//                       ₦{Number(invoice.amount).toLocaleString()}
//                     </td>
//                     <td className="px-6 py-4">
//                       <span
//                         className={`px-2.5 py-1 rounded-full text-xs font-medium ${
//                           invoice.status === "paid"
//                             ? "bg-green-50 text-green-700"
//                             : "bg-red-50 text-red-700"
//                         }`}
//                       >
//                         {invoice.status === "paid" ? "Paid" : "Failed"}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       <ChangePlanDialog
//         open={dialogOpen}
//         onOpenChange={setDialogOpen}
//         currentPlan={plan}
//         onConfirm={handleConfirmPlan}
//       />
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Dropbox, Wallet2 } from "iconsax-react";
import { PlanKey, PLANS } from "@/components/Plan";
import ChangePlanDialog from "./ChangePlanDialog";
import EmptyState from "@/components/reusuable/EmptyState";

export type Invoice = {
  id: string;
  amount: number;
  status: "paid" | "failed";
  paid_at: string;
};

type Props = {
  plan: PlanKey;
  planStatus: string;
  planRenewsAt: string | null;
  hasPaymentMethod: boolean;
  invoices: Invoice[];
};

const planStatusStyles: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  inactive: "bg-gray-100 text-gray-500",
  past_due: "bg-yellow-50 text-yellow-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function BillingManager({
  plan,
  planStatus,
  planRenewsAt,
  hasPaymentMethod,
  invoices,
}: Props) {
  const searchParams = useSearchParams();
  const justPaid = searchParams.get("reference");
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleConfirmPlan(selected: PlanKey) {
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selected }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Couldn't start checkout.");
    }

    window.location.href = json.url;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Billing</h1>
      <p className="text-sm text-gray-500 mb-8">
        Manage your subscription and payment details.
      </p>

      {justPaid && (
        <div className="mb-6 rounded-2xl bg-green-50 text-green-700 text-sm px-4 py-3">
          Payment received — this can take a minute to reflect below. Refresh if
          your plan doesn&rsquo;t update right away.
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <Wallet2 size={22} color="currentColor" variant="Bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-900">{PLANS[plan].name} plan</p>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  planStatusStyles[planStatus] ?? planStatusStyles.inactive
                }`}
              >
                {planStatus.replace("_", " ")}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              ₦{PLANS[plan].monthly.toLocaleString()}/mo
              {planRenewsAt &&
                ` · Renews ${new Date(planRenewsAt).toLocaleDateString(
                  "en-NG",
                  { day: "numeric", month: "long", year: "numeric" },
                )}`}
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
          <p className="text-sm text-gray-500 mt-1">
            {hasPaymentMethod
              ? "Your card is saved securely with Paystack."
              : "Added automatically on your first payment."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm mt-6 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Billing history</h2>
        </div>

        {invoices.length === 0 ? (
          <div className="bg-white rounded-3xl">
            <EmptyState
              icon={<Dropbox size={28} color="#16A34A" />}
              title="No payments yet"
              description="No payments yet. Payment will show up here once you make payment
          foe the plan you want."
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
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                      {invoice.id}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      ₦{Number(invoice.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
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

      <ChangePlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentPlan={plan}
        onConfirm={handleConfirmPlan}
      />
    </div>
  );
}
