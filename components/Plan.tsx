// // export type PlanKey = "starter" | "growth" | "business";

// // export const PLANS: Record<PlanKey, { name: string; price: number }> = {
// //   starter: { name: "Starter", price: 5000 },
// //   growth: { name: "Growth", price: 12000 },
// //   business: { name: "Business", price: 25000 },
// // };

// // export const PLAN_ORDER: PlanKey[] = ["starter", "growth", "business"];

// export type PlanKey = "starter" | "growth" | "business";

// export type Plan = {
//   name: string;
//   description: string;
//   monthly: number;
//   yearly: number;
//   popular?: boolean;
//   features: string[];
// };

// export const PLANS: Record<PlanKey, Plan> = {
//   starter: {
//     name: "Starter",
//     description: "For new food businesses just getting online.",
//     monthly: 5000,
//     yearly: 4000,
//     features: [
//       "Digital menu with photos & prices",
//       "Shareable menu link + QR code",
//       "Up to 30 menu items",
//       "WhatsApp orders",
//     ],
//   },
//   growth: {
//     name: "Growth",
//     description: "For businesses ready to take more orders.",
//     monthly: 12000,
//     yearly: 9600,
//     popular: true,
//     features: [
//       "Everything in Starter",
//       "Unlimited menu items",
//       "Order analytics & history",
//       "Custom menu domain",
//       "Priority WhatsApp support",
//     ],
//   },
//   business: {
//     name: "Business",
//     description: "For multi-location restaurants and chains.",
//     monthly: 25000,
//     yearly: 20000,
//     features: [
//       "Everything in Growth",
//       "Up to 5 outlets",
//       "Staff accounts & roles",
//       "Dedicated onboarding",
//     ],
//   },
// };

// export const PLAN_ORDER: PlanKey[] = ["starter", "growth", "business"];

// export type BillingPeriod = "monthly" | "half_year" | "annual";

// export type SubscriptionPlan = {
//   name: string;
//   description: string;
//   price: number;
//   durationMonths: number;
//   popular?: boolean;
//   badge?: string;
// };

// export const SUBSCRIPTION_PLANS: Record<BillingPeriod, SubscriptionPlan> = {
//   monthly: {
//     name: "Monthly",
//     description: "Simple month-to-month access to everything in Bukka.",
//     price: 2000,
//     durationMonths: 1,
//   },

//   half_year: {
//     name: "6 Months",
//     description:
//       "Stay active for six months and save compared with monthly billing.",
//     price: 11000,
//     durationMonths: 6,
//     popular: true,
//     badge: "Most popular",
//   },

//   annual: {
//     name: "Annual",
//     description: "The best value for businesses staying online all year.",
//     price: 22000,
//     durationMonths: 12,
//     badge: "Best value",
//   },
// };

// export const PLAN_ORDER: BillingPeriod[] = ["monthly", "half_year", "annual"];

// export const SUBSCRIPTION_FEATURES = [
//   "Digital menu with photos and prices",
//   "Unlimited menu items",
//   "Shareable menu link",
//   "Downloadable QR code",
//   "WhatsApp ordering",
//   "Order management",
//   "Order history and analytics",
//   "Revenue and menu performance dashboard",
// ];

export type BillingPeriod = "monthly" | "half_year" | "annual";

export type SubscriptionPlan = {
  name: string;
  description: string;
  price: number;
  durationMonths: number;
  popular?: boolean;
  badge?: string;
};

export const SUBSCRIPTION_PLANS: Record<BillingPeriod, SubscriptionPlan> = {
  monthly: {
    name: "Monthly",
    description: "Simple month-to-month access to everything in Bukka.",
    price: 2000,
    durationMonths: 1,
  },

  half_year: {
    name: "6 Months",
    description: "Stay active for six months and save.",
    price: 11000,
    durationMonths: 6,
    popular: true,
    badge: "Most popular",
  },

  annual: {
    name: "Annual",
    description: "Best value for businesses staying online all year.",
    price: 22000,
    durationMonths: 12,
    badge: "Best value",
  },
};

export const PLAN_ORDER: BillingPeriod[] = ["monthly", "half_year", "annual"];

export const SUBSCRIPTION_FEATURES = [
  "Digital menu with photos and prices",
  "Unlimited menu items",
  "Shareable menu link",
  "Downloadable QR code",
  "WhatsApp ordering",
  "Order management",
  "Order history and analytics",
  "Revenue and menu performance dashboard",
];

export function getBillingPeriodLabel(period: BillingPeriod) {
  switch (period) {
    case "monthly":
      return "Monthly";

    case "half_year":
      return "6 Months";

    case "annual":
      return "Annual";

    default:
      return "";
  }
}

export function getBillingPeriodSuffix(period: BillingPeriod) {
  switch (period) {
    case "monthly":
      return "/ month";

    case "half_year":
      return "/ 6 months";

    case "annual":
      return "/ year";

    default:
      return "";
  }
}