"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CloseCircle } from "iconsax-react";

type CompleteProfilePopupProps = {
  isProfileComplete: boolean;
  userId: string;
};

export default function CompleteProfilePopup({
  isProfileComplete,
  userId,
}: CompleteProfilePopupProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isProfileComplete) {
      setOpen(false);
      return;
    }

    const dismissed = sessionStorage.getItem(
      `mybukka-profile-popup-dismissed-${userId}`,
    );

    setOpen(!dismissed);
  }, [isProfileComplete, userId]);

  function handleClose() {
    sessionStorage.setItem(`mybukka-profile-popup-dismissed-${userId}`, "true");
    setOpen(false);
  }

  if (!open || isProfileComplete) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="complete-profile-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Close popup"
        >
          <CloseCircle size={24} color="currentColor" />
        </button>

        <div className="mb-4 text-4xl">🎉</div>

        <h2
          id="complete-profile-title"
          className="mb-3 text-xl font-bold text-gray-900"
        >
          Welcome to MyBukka!
        </h2>

        <p className="mb-4 text-sm leading-6 text-gray-600">
          Your account is ready! You're just a few steps away from showcasing
          your delicious meals to customers.
        </p>

        <p className="mb-6 text-sm leading-6 text-gray-600">
          Head over to your settings to complete your business profile. Add your
          business name, WhatsApp number, and other important details so
          customers can easily discover and order from you.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Maybe Later
          </button>

          <Link
            href="/dashboard/settings"
            onClick={handleClose}
            className="rounded-xl bg-green-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-green-700"
          >
            Update Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
