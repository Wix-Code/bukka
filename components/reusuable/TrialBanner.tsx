import Link from "next/link";
import { isTrialActive, trialDaysLeft } from "../Trails";

type Props = {
  planStatus: string;
  trialEndsAt: string | null;
};

export default function TrialBanner({ planStatus, trialEndsAt }: Props) {
  if (planStatus === "active") return null;

  const active = isTrialActive({
    plan_status: planStatus,
    trial_ends_at: trialEndsAt,
  });

  if (active) {
    const daysLeft = trialDaysLeft(trialEndsAt);

    console.log("TrialBanner: daysLeft", daysLeft, "trialEndsAt", trialEndsAt);
    return (
      <div className="mb-6 rounded-2xl bg-green-50 text-green-700 text-sm px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <span>
          {daysLeft} day{daysLeft === 1 ? "" : "s"} left in your free trial.
        </span>
        <Link
          href="/dashboard/billing"
          className="font-medium underline underline-offset-2 whitespace-nowrap"
        >
          Subscribe now
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3 flex flex-wrap items-center justify-between gap-2">
      <span>
        Your free trial has ended. Subscribe to keep managing your menu.
      </span>
      <Link
        href="/dashboard/billing"
        className="font-medium underline underline-offset-2 whitespace-nowrap"
      >
        Subscribe now
      </Link>
    </div>
  );
}
