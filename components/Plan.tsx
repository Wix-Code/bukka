// export type PlanKey = "starter" | "growth" | "business";

// export const PLANS: Record<PlanKey, { name: string; price: number }> = {
//   starter: { name: "Starter", price: 5000 },
//   growth: { name: "Growth", price: 12000 },
//   business: { name: "Business", price: 25000 },
// };

// export const PLAN_ORDER: PlanKey[] = ["starter", "growth", "business"];

export type PlanKey = "starter" | "growth" | "business";

export type Plan = {
  name: string;
  description: string;
  monthly: number;
  yearly: number;
  popular?: boolean;
  features: string[];
};

export const PLANS: Record<PlanKey, Plan> = {
  starter: {
    name: "Starter",
    description: "For new food businesses just getting online.",
    monthly: 5000,
    yearly: 4000,
    features: [
      "Digital menu with photos & prices",
      "Shareable menu link + QR code",
      "Up to 30 menu items",
      "WhatsApp orders",
    ],
  },
  growth: {
    name: "Growth",
    description: "For businesses ready to take more orders.",
    monthly: 12000,
    yearly: 9600,
    popular: true,
    features: [
      "Everything in Starter",
      "Unlimited menu items",
      "Order analytics & history",
      "Custom menu domain",
      "Priority WhatsApp support",
    ],
  },
  business: {
    name: "Business",
    description: "For multi-location restaurants and chains.",
    monthly: 25000,
    yearly: 20000,
    features: [
      "Everything in Growth",
      "Up to 5 outlets",
      "Staff accounts & roles",
      "Dedicated onboarding",
    ],
  },
};

export const PLAN_ORDER: PlanKey[] = ["starter", "growth", "business"];