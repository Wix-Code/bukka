export default function BillingLoading() {
  return (
    <div
      className="w-full animate-pulse"
      role="status"
      aria-label="Loading billing information"
    >
      <span className="sr-only">Loading your billing information...</span>

      {/* Page Header */}
      <div className="mb-8 space-y-3">
        <div className="h-7 w-28 rounded-lg bg-gray-200" />
        <div className="h-4 w-80 max-w-full rounded-md bg-gray-100" />
      </div>

      {/* Current Subscription */}
      <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          {/* Subscription Icon */}
          <div className="h-11 w-11 shrink-0 rounded-xl bg-green-50">
            <div className="m-3 h-5 w-5 rounded-md bg-green-100" />
          </div>

          {/* Subscription Information */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-5 w-44 rounded-md bg-gray-200" />
              <div className="h-6 w-16 rounded-full bg-green-100" />
            </div>

            <div className="h-4 w-64 max-w-full rounded-md bg-gray-100" />
            <div className="h-4 w-40 rounded-md bg-gray-100" />
          </div>
        </div>

        {/* Change Plan Button */}
        <div className="h-11 w-40 rounded-full bg-gray-100" />
      </div>

      {/* Subscription Features */}
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-green-50" />

          <div className="space-y-3">
            <div className="h-5 w-40 rounded-md bg-gray-200" />
            <div className="h-4 w-64 max-w-full rounded-md bg-gray-100" />
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              {/* Check Icon */}
              <div className="h-4 w-4 shrink-0 rounded-full bg-green-100" />

              {/* Feature Name */}
              <div
                className={`h-4 rounded-md bg-gray-100 ${
                  index % 3 === 0 ? "w-40" : index % 3 === 1 ? "w-32" : "w-48"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <div className="space-y-3">
          <div className="h-5 w-36 rounded-md bg-gray-200" />
          <div className="h-4 w-80 max-w-full rounded-md bg-gray-100" />
        </div>
      </div>

      {/* Billing History */}
      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        {/* History Header */}
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="h-5 w-32 rounded-md bg-gray-200" />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-5 border-b border-gray-100 px-6 py-4">
              {["Date", "Reference", "Amount", "Status"].map((heading) => (
                <div
                  key={heading}
                  className="h-4 w-20 rounded-md bg-gray-100"
                />
              ))}
            </div>

            {/* Table Rows */}
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-4 items-center gap-5 border-b border-gray-50 px-6 py-5 last:border-b-0"
              >
                {/* Date */}
                <div className="h-4 w-24 rounded-md bg-gray-100" />

                {/* Reference */}
                <div className="h-4 w-32 rounded-md bg-gray-200" />

                {/* Amount */}
                <div className="h-4 w-20 rounded-md bg-gray-100" />

                {/* Status */}
                <div className="h-6 w-20 rounded-full bg-green-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
