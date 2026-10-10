export default function SettingsLoading() {
  return (
    <div
      className="w-full max-w-lg animate-pulse"
      role="status"
      aria-label="Loading settings"
    >
      <span className="sr-only">Loading restaurant settings...</span>

      {/* Page Header */}
      <div className="mb-8 space-y-3">
        <div className="h-7 w-28 rounded-lg bg-gray-200" />
        <div className="h-4 w-72 max-w-full rounded-md bg-gray-100" />
      </div>

      {/* Settings Form */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {/* Profile Picture */}
        <div className="mb-6 space-y-3">
          <div className="h-4 w-28 rounded-md bg-gray-200" />

          <div className="flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 rounded-2xl bg-gray-200" />

            <div className="space-y-2">
              <div className="h-9 w-28 rounded-full bg-gray-100" />
              <div className="h-3 w-36 rounded-md bg-gray-100" />
            </div>
          </div>
        </div>

        {/* Restaurant Name */}
        <div className="mb-5 space-y-2">
          <div className="h-4 w-32 rounded-md bg-gray-200" />
          <div className="h-12 w-full rounded-2xl bg-gray-100" />
        </div>

        {/* Description */}
        <div className="mb-5 space-y-2">
          <div className="h-4 w-24 rounded-md bg-gray-200" />
          <div className="h-28 w-full rounded-2xl bg-gray-100" />
        </div>

        {/* Location, Opening Hours, WhatsApp */}
        {["Location", "Opening hours", "WhatsApp number"].map((field) => (
          <div key={field} className="mb-5 space-y-2">
            <div className="h-4 w-32 rounded-md bg-gray-200" />
            <div className="h-12 w-full rounded-2xl bg-gray-100" />

            {field === "WhatsApp number" && (
              <div className="h-3 w-52 max-w-full rounded-md bg-gray-100" />
            )}
          </div>
        ))}

        {/* Cover Photo */}
        <div className="mb-6 space-y-3">
          <div className="h-4 w-28 rounded-md bg-gray-200" />
          <div className="h-40 w-full rounded-2xl bg-gray-100" />
          <div className="h-3 w-60 max-w-full rounded-md bg-gray-100" />
        </div>

        {/* Save Button */}
        <div className="h-11 w-36 rounded-full bg-green-100" />
      </div>

      {/* Password Section */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <div className="space-y-3">
          <div className="h-5 w-24 rounded-md bg-gray-200" />
          <div className="h-4 w-64 max-w-full rounded-md bg-gray-100" />
        </div>

        <div className="h-10 w-40 rounded-full bg-gray-100" />
      </div>
    </div>
  );
}
