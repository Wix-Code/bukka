// import { NextResponse } from "next/server";
// import { verifyPaystackSignature } from "@/lib/paystack";
// import { createSupabaseAdminClient } from "@/lib/admin";
// import { PlanKey } from "@/components/Plan";

// function addOneMonth(date: Date) {
//   const result = new Date(date);

//   const originalDay = result.getUTCDate();

//   // Move to first day to avoid month overflow issues
//   result.setUTCDate(1);
//   result.setUTCMonth(result.getUTCMonth() + 1);

//   // Get last day of target month
//   const lastDayOfTargetMonth = new Date(
//     Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
//   ).getUTCDate();

//   result.setUTCDate(Math.min(originalDay, lastDayOfTargetMonth));

//   return result;
// }

// export async function POST(request: Request) {
//   const rawBody = await request.text();
//   const signature = request.headers.get("x-paystack-signature");

//   if (!verifyPaystackSignature(rawBody, signature)) {
//     console.error("Paystack webhook: signature verification failed.");

//     return NextResponse.json(
//       {
//         error: "Invalid signature.",
//       },
//       {
//         status: 401,
//       },
//     );
//   }

//   const event = JSON.parse(rawBody);

//   console.log("Paystack webhook event:", event.event);

//   const supabase = createSupabaseAdminClient();

//   let hadError = false;

//   switch (event.event) {
//     /*
//      * Successful initial payment and successful
//      * recurring subscription payments.
//      */
//     case "charge.success": {
//       const data = event.data;

//       const metadataVendorId: string | undefined = data.metadata?.vendor_id;

//       const planKey: PlanKey | undefined = data.metadata?.plan_key;

//       let vendorId = metadataVendorId;

//       /*
//        * Recurring subscription charges may not
//        * include the metadata from the original
//        * transaction.
//        *
//        * In that situation find the vendor by
//        * Paystack customer code.
//        */
//       if (!vendorId) {
//         const { data: match, error: lookupError } = await supabase
//           .from("vendors")
//           .select("id")
//           .eq("paystack_customer_code", data.customer.customer_code)
//           .single();

//         if (lookupError) {
//           console.error(
//             "Paystack webhook: couldn't find vendor by customer_code:",
//             lookupError.message,
//           );

//           hadError = true;
//         }

//         vendorId = match?.id;
//       }

//       if (!vendorId) {
//         console.error(
//           "Paystack webhook: no vendor resolved for charge",
//           data.reference,
//         );

//         hadError = true;
//         break;
//       }

//       /*
//        * Use Paystack's actual successful payment
//        * time as the beginning of the paid period.
//        */
//       const paidAt = new Date(
//         data.paid_at ?? data.paidAt ?? new Date().toISOString(),
//       );

//       /*
//        * Monthly subscription:
//        * next renewal = one calendar month after
//        * successful payment.
//        */
//       const renewsAt = addOneMonth(paidAt);

//       console.log("Payment date:", paidAt.toISOString());

//       console.log("Calculated renewal date:", renewsAt.toISOString());

//       /*
//        * Store payment invoice.
//        */
//       const { error: invoiceError } = await supabase.from("invoices").upsert(
//         {
//           id: data.reference,

//           vendor_id: vendorId,

//           amount: data.amount / 100,

//           status: "paid",

//           paid_at: paidAt.toISOString(),
//         },
//         {
//           onConflict: "id",
//         },
//       );

//       if (invoiceError) {
//         console.error(
//           "Paystack webhook: invoice upsert failed:",
//           invoiceError.message,
//         );

//         hadError = true;
//       }

//       /*
//        * Activate the plan and establish the
//        * new paid-through date.
//        */
//       const update: Record<string, unknown> = {
//         plan_status: "active",

//         paystack_customer_code: data.customer.customer_code,

//         plan_renews_at: renewsAt.toISOString(),
//       };

//       if (planKey) {
//         update.plan = planKey;
//       }

//       const { error: vendorUpdateError } = await supabase
//         .from("vendors")
//         .update(update)
//         .eq("id", vendorId);

//       if (vendorUpdateError) {
//         console.error(
//           "Paystack webhook: vendor plan update failed:",
//           vendorUpdateError.message,
//         );

//         hadError = true;
//       }

//       break;
//     }

//     /*
//      * Subscription creation.
//      *
//      * Store the subscription code, but don't
//      * overwrite plan_renews_at with an earlier
//      * Paystack date.
//      */
//     case "subscription.create": {
//       const data = event.data;

//       console.log("Paystack subscription created:", {
//         subscription_code: data.subscription_code,

//         next_payment_date: data.next_payment_date,

//         customer_code: data.customer?.customer_code,
//       });

//       const customerCode = data.customer?.customer_code;

//       if (!customerCode) {
//         console.error(
//           "Paystack webhook: subscription.create has no customer code.",
//         );

//         hadError = true;
//         break;
//       }

//       /*
//        * Get the vendor's existing renewal date.
//        */
//       const { data: vendor, error: lookupError } = await supabase
//         .from("vendors")
//         .select("id, plan_renews_at")
//         .eq("paystack_customer_code", customerCode)
//         .single();

//       if (lookupError || !vendor) {
//         console.error(
//           "Paystack webhook: couldn't resolve vendor during subscription.create:",
//           lookupError?.message,
//         );

//         hadError = true;
//         break;
//       }

//       const update: Record<string, unknown> = {
//         paystack_subscription_code: data.subscription_code,
//       };

//       /*
//        * Only use Paystack's next_payment_date
//        * if we do not already have a paid-through
//        * date.
//        */
//       if (!vendor.plan_renews_at && data.next_payment_date) {
//         update.plan_renews_at = data.next_payment_date;
//       }

//       const { error } = await supabase
//         .from("vendors")
//         .update(update)
//         .eq("id", vendor.id);

//       if (error) {
//         console.error(
//           "Paystack webhook: subscription.create update failed:",
//           error.message,
//         );

//         hadError = true;
//       }

//       break;
//     }

//     case "subscription.disable":
//     case "subscription.not_renew": {
//       const data = event.data;

//       const { error } = await supabase
//         .from("vendors")
//         .update({
//           plan_status: "cancelled",
//         })
//         .eq("paystack_subscription_code", data.subscription_code);

//       if (error) {
//         console.error(
//           "Paystack webhook: subscription cancel update failed:",
//           error.message,
//         );

//         hadError = true;
//       }

//       break;
//     }

//     case "invoice.payment_failed": {
//       const data = event.data;

//       const { error } = await supabase
//         .from("vendors")
//         .update({
//           plan_status: "past_due",
//         })
//         .eq("paystack_customer_code", data.customer.customer_code);

//       if (error) {
//         console.error(
//           "Paystack webhook: payment_failed update failed:",
//           error.message,
//         );

//         hadError = true;
//       }

//       break;
//     }

//     default:
//       console.log("Paystack webhook: unhandled event type:", event.event);

//       break;
//   }

//   if (hadError) {
//     return NextResponse.json(
//       {
//         received: true,
//         error: "Processing error — see server logs.",
//       },
//       {
//         status: 500,
//       },
//     );
//   }

//   return NextResponse.json({
//     received: true,
//   });
// }

import { NextResponse } from "next/server";

import { verifyPaystackSignature } from "@/lib/paystack";
import { createSupabaseAdminClient } from "@/lib/admin";

import type { BillingPeriod } from "@/components/Plan";

const VALID_BILLING_PERIODS: BillingPeriod[] = [
  "monthly",
  "half_year",
  "annual",
];

function isBillingPeriod(value: unknown): value is BillingPeriod {
  return (
    typeof value === "string" &&
    VALID_BILLING_PERIODS.includes(value as BillingPeriod)
  );
}

/**
 * Adds calendar months safely.
 *
 * Example:
 * Jan 31 + 1 month -> Feb 28/29
 */
function addMonths(date: Date, months: number) {
  const result = new Date(date);

  const originalDay = result.getUTCDate();

  result.setUTCDate(1);

  result.setUTCMonth(result.getUTCMonth() + months);

  const lastDayOfTargetMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();

  result.setUTCDate(Math.min(originalDay, lastDayOfTargetMonth));

  return result;
}

function getSubscriptionEndDate(startDate: Date, billingPeriod: BillingPeriod) {
  switch (billingPeriod) {
    case "monthly":
      return addMonths(startDate, 1);

    case "half_year":
      return addMonths(startDate, 6);

    case "annual":
      return addMonths(startDate, 12);

    default:
      return addMonths(startDate, 1);
  }
}

export async function POST(request: Request) {
  try {
    /* -------------------------------------------------- */
    /* VERIFY PAYSTACK SIGNATURE                           */
    /* -------------------------------------------------- */

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

    /* -------------------------------------------------- */
    /* PARSE EVENT                                         */
    /* -------------------------------------------------- */

    let event: {
      event: string;
      data: any;
    };

    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        {
          error: "Invalid webhook payload.",
        },
        {
          status: 400,
        },
      );
    }

    console.log("Paystack webhook event:", event.event);

    const supabase = createSupabaseAdminClient();

    let hadError = false;

    /* -------------------------------------------------- */
    /* EVENTS                                              */
    /* -------------------------------------------------- */

    switch (event.event) {
      /* ================================================== */
      /* SUCCESSFUL PAYMENT                                 */
      /* ================================================== */

      case "charge.success": {
        const data = event.data;

        const metadata = data.metadata ?? {};

        const metadataVendorId: string | undefined = metadata.vendor_id;

        const metadataBillingPeriod = metadata.billing_period;

        let vendorId = metadataVendorId;

        /*
         * First payment normally includes
         * vendor_id in metadata.
         *
         * Recurring payments may not,
         * so fall back to the Paystack
         * customer code.
         */
        if (!vendorId) {
          const customerCode = data.customer?.customer_code;

          if (!customerCode) {
            console.error(
              "Paystack webhook: charge has no vendor_id or customer code.",
            );

            hadError = true;

            break;
          }

          const { data: matchedVendor, error: lookupError } = await supabase
            .from("vendors")
            .select(
              `
              id,
              billing_period,
              subscription_ends_at
            `,
            )
            .eq("paystack_customer_code", customerCode)
            .single();

          if (lookupError || !matchedVendor) {
            console.error(
              "Paystack webhook: couldn't resolve vendor from customer code:",
              lookupError?.message,
            );

            hadError = true;

            break;
          }

          vendorId = matchedVendor.id;
        }

        if (!vendorId) {
          console.error(
            "Paystack webhook: no vendor resolved for charge:",
            data.reference,
          );

          hadError = true;

          break;
        }

        /* ---------------------------------------------- */
        /* LOAD VENDOR                                    */
        /* ---------------------------------------------- */

        const { data: vendor, error: vendorLookupError } = await supabase
          .from("vendors")
          .select(
            `
            id,
            billing_period,
            subscription_ends_at,
            plan_status
          `,
          )
          .eq("id", vendorId)
          .single();

        if (vendorLookupError || !vendor) {
          console.error(
            "Paystack webhook: vendor lookup failed:",
            vendorLookupError?.message,
          );

          hadError = true;

          break;
        }

        /* ---------------------------------------------- */
        /* RESOLVE BILLING PERIOD                         */
        /* ---------------------------------------------- */

        let billingPeriod: BillingPeriod | null = null;

        if (isBillingPeriod(metadataBillingPeriod)) {
          billingPeriod = metadataBillingPeriod;
        } else if (isBillingPeriod(vendor.billing_period)) {
          billingPeriod = vendor.billing_period;
        }

        if (!billingPeriod) {
          console.error(
            "Paystack webhook: unable to determine billing period for:",
            data.reference,
          );

          hadError = true;

          break;
        }

        /* ---------------------------------------------- */
        /* PAYMENT DATE                                   */
        /* ---------------------------------------------- */

        const paidAt = new Date(
          data.paid_at ?? data.paidAt ?? new Date().toISOString(),
        );

        if (Number.isNaN(paidAt.getTime())) {
          console.error("Paystack webhook: invalid paid_at date.");

          hadError = true;

          break;
        }

        /* ---------------------------------------------- */
        /* CALCULATE SUBSCRIPTION PERIOD                  */
        /* ---------------------------------------------- */

        /*
         * If the vendor renews before the current
         * subscription ends, extend from the current
         * subscription end date.
         *
         * If already expired, start from paidAt.
         */

        const existingEnd = vendor.subscription_ends_at
          ? new Date(vendor.subscription_ends_at)
          : null;

        const existingEndIsFuture =
          existingEnd &&
          !Number.isNaN(existingEnd.getTime()) &&
          existingEnd > paidAt;

        const periodStart = existingEndIsFuture ? existingEnd : paidAt;

        const subscriptionEndsAt = getSubscriptionEndDate(
          periodStart,
          billingPeriod,
        );

        console.log("Paystack successful payment:", {
          vendorId,
          reference: data.reference,
          billingPeriod,
          paidAt: paidAt.toISOString(),
          periodStart: periodStart.toISOString(),
          subscriptionEndsAt: subscriptionEndsAt.toISOString(),
        });

        /* ---------------------------------------------- */
        /* STORE INVOICE                                  */
        /* ---------------------------------------------- */

        const { error: invoiceError } = await supabase.from("invoices").upsert(
          {
            id: data.reference,

            vendor_id: vendorId,

            amount: Number(data.amount) / 100,

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

        /* ---------------------------------------------- */
        /* ACTIVATE / EXTEND SUBSCRIPTION                 */
        /* ---------------------------------------------- */

        const customerCode = data.customer?.customer_code ?? null;

        const update: Record<string, unknown> = {
          plan_status: "active",

          billing_period: billingPeriod,

          subscription_ends_at: subscriptionEndsAt.toISOString(),
        };

        if (customerCode) {
          update.paystack_customer_code = customerCode;
        }

        const { error: vendorUpdateError } = await supabase
          .from("vendors")
          .update(update)
          .eq("id", vendorId);

        if (vendorUpdateError) {
          console.error(
            "Paystack webhook: vendor subscription update failed:",
            vendorUpdateError.message,
          );

          hadError = true;
        }

        break;
      }

      /* ================================================== */
      /* SUBSCRIPTION CREATED                               */
      /* ================================================== */

      case "subscription.create": {
        const data = event.data;

        const customerCode = data.customer?.customer_code;

        const subscriptionCode = data.subscription_code;

        console.log("Paystack subscription created:", {
          subscriptionCode,
          customerCode,
          nextPaymentDate: data.next_payment_date,
        });

        if (!customerCode || !subscriptionCode) {
          console.error(
            "Paystack webhook: subscription.create missing required details.",
          );

          hadError = true;

          break;
        }

        const { data: vendor, error: lookupError } = await supabase
          .from("vendors")
          .select(
            `
            id,
            subscription_ends_at
          `,
          )
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

        /*
         * Do not overwrite subscription_ends_at here.
         *
         * charge.success is our source of truth
         * for paid access.
         */
        const { error } = await supabase
          .from("vendors")
          .update({
            paystack_subscription_code: subscriptionCode,
          })
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

      /* ================================================== */
      /* SUBSCRIPTION WILL NOT RENEW                        */
      /* ================================================== */

      case "subscription.not_renew": {
        const data = event.data;

        /*
         * IMPORTANT:
         *
         * Do NOT set plan_status = cancelled here.
         *
         * The customer has already paid through
         * subscription_ends_at and should keep access
         * until that date.
         *
         * Paystack uses this event to indicate that
         * another automatic charge will not happen.
         */

        console.log(
          "Paystack subscription set not to renew:",
          data.subscription_code,
        );

        /*
         * Recommended if you add this column:
         *
         * auto_renew BOOLEAN DEFAULT true
         */

        const { error } = await supabase
          .from("vendors")
          .update({
            auto_renew: false,
          })
          .eq("paystack_subscription_code", data.subscription_code);

        if (error) {
          console.error(
            "Paystack webhook: subscription.not_renew update failed:",
            error.message,
          );

          hadError = true;
        }

        break;
      }

      /* ================================================== */
      /* SUBSCRIPTION DISABLED                              */
      /* ================================================== */

      case "subscription.disable": {
        const data = event.data;

        const subscriptionCode = data.subscription_code;

        if (!subscriptionCode) {
          console.error(
            "Paystack webhook: subscription.disable missing subscription code.",
          );

          hadError = true;

          break;
        }

        const { data: vendor, error: lookupError } = await supabase
          .from("vendors")
          .select(
            `
            id,
            subscription_ends_at
          `,
          )
          .eq("paystack_subscription_code", subscriptionCode)
          .single();

        if (lookupError || !vendor) {
          console.error(
            "Paystack webhook: couldn't resolve vendor for subscription.disable:",
            lookupError?.message,
          );

          hadError = true;

          break;
        }

        /*
         * A disable event should stop future renewal.
         *
         * If the customer still has time left in the
         * already-paid subscription period, leave
         * plan_status active until that date.
         */

        const now = new Date();

        const subscriptionEnd = vendor.subscription_ends_at
          ? new Date(vendor.subscription_ends_at)
          : null;

        const stillPaid =
          subscriptionEnd &&
          !Number.isNaN(subscriptionEnd.getTime()) &&
          subscriptionEnd > now;

        const update: Record<string, unknown> = {
          auto_renew: false,
        };

        if (!stillPaid) {
          update.plan_status = "cancelled";
        }

        const { error } = await supabase
          .from("vendors")
          .update(update)
          .eq("id", vendor.id);

        if (error) {
          console.error(
            "Paystack webhook: subscription.disable update failed:",
            error.message,
          );

          hadError = true;
        }

        break;
      }

      /* ================================================== */
      /* SUBSCRIPTION PAYMENT FAILED                        */
      /* ================================================== */

      case "invoice.payment_failed": {
        const data = event.data;

        const customerCode = data.customer?.customer_code;

        if (!customerCode) {
          console.error(
            "Paystack webhook: invoice.payment_failed has no customer code.",
          );

          hadError = true;

          break;
        }

        /*
         * Don't necessarily revoke access immediately.
         *
         * If subscription_ends_at is still in the
         * future, the vendor has already paid for that
         * access period.
         */

        const { data: vendor, error: lookupError } = await supabase
          .from("vendors")
          .select(
            `
            id,
            subscription_ends_at
          `,
          )
          .eq("paystack_customer_code", customerCode)
          .single();

        if (lookupError || !vendor) {
          console.error(
            "Paystack webhook: failed-payment vendor lookup failed:",
            lookupError?.message,
          );

          hadError = true;

          break;
        }

        const now = new Date();

        const subscriptionEnd = vendor.subscription_ends_at
          ? new Date(vendor.subscription_ends_at)
          : null;

        const stillPaid =
          subscriptionEnd &&
          !Number.isNaN(subscriptionEnd.getTime()) &&
          subscriptionEnd > now;

        /*
         * Only move to past_due once the
         * paid-through period has ended.
         */
        if (!stillPaid) {
          const { error } = await supabase
            .from("vendors")
            .update({
              plan_status: "past_due",
            })
            .eq("id", vendor.id);

          if (error) {
            console.error(
              "Paystack webhook: payment_failed update failed:",
              error.message,
            );

            hadError = true;
          }
        }

        break;
      }

      /* ================================================== */
      /* OTHER EVENTS                                       */
      /* ================================================== */

      default: {
        console.log("Paystack webhook: unhandled event type:", event.event);

        break;
      }
    }

    /* -------------------------------------------------- */
    /* RESPONSE                                            */
    /* -------------------------------------------------- */

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
  } catch (error) {
    console.error("Paystack webhook fatal error:", error);

    return NextResponse.json(
      {
        received: false,
        error: "Webhook processing failed.",
      },
      {
        status: 500,
      },
    );
  }
}