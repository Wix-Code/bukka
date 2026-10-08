export type TrialAwareVendor = {
  plan_status: string;
  trial_ends_at: string | null;
};

export function isTrialActive(vendor: TrialAwareVendor): boolean {
  if (vendor.plan_status === "active") return true;
  if (!vendor.trial_ends_at) return false;
  return new Date(vendor.trial_ends_at) > new Date();
}

export function trialDaysLeft(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0;
  const diffMs = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
