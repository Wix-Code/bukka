export type PlanKey = "starter" | "growth" | "business";

export const PLANS: Record<PlanKey, { name: string; price: number }> = {
  starter: { name: "Starter", price: 5000 },
  growth: { name: "Growth", price: 12000 },
  business: { name: "Business", price: 25000 },
};

export const PLAN_ORDER: PlanKey[] = ["starter", "growth", "business"];
