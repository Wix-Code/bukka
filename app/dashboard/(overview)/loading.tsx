export default function DashboardLoading() {
  const stats = Array.from({ length: 7 });

  return (
    <div
      className="w-full animate-pulse"
      role="status"
      aria-label="Loading dashboard"
    >
      <span className="sr-only">Loading your dashboard...</span>

      {/* Welcome Message */}
      <div className="mb-6">
        <div className="h-5 w-72 max-w-full rounded-lg bg-gray-200" />
      </div>

      {/* Trial Banner */}
      <div className="mb-6 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="h-5 w-40 rounded-lg bg-purple-100" />
            <div className="h-3 w-64 max-w-full rounded-lg bg-gray-100" />
          </div>

          <div className="h-10 w-28 rounded-full bg-purple-100" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((_, index) => (
          <div key={index} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <div className="h-5 w-5 rounded-md bg-gray-200" />
            </div>

            <div className="mt-4 h-8 w-24 rounded-lg bg-gray-200" />
            <div className="mt-3 h-4 w-32 rounded-md bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Menu QR Card */}
      <div className="mt-8 flex flex-wrap items-center gap-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="h-38 w-38 shrink-0 rounded-xl bg-gray-100" />

        <div className="min-w-[220px] flex-1 space-y-4">
          <div className="h-5 w-36 rounded-lg bg-gray-200" />
          <div className="h-4 w-64 max-w-full rounded-lg bg-gray-100" />

          <div className="flex flex-wrap gap-3 pt-1">
            <div className="h-10 w-28 rounded-full bg-gray-100" />
            <div className="h-10 w-36 rounded-full bg-gray-100" />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="h-5 w-32 rounded-lg bg-gray-200" />
          <div className="h-4 w-16 rounded-md bg-gray-100" />
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[550px]">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-5 border-b border-gray-100 px-6 py-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-4 w-20 rounded-md bg-gray-100" />
              ))}
            </div>

            {/* Table Rows */}
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-4 items-center gap-5 border-b border-gray-50 px-6 py-5 last:border-b-0"
              >
                <div className="h-4 w-28 rounded-md bg-gray-200" />
                <div className="h-4 w-20 rounded-md bg-gray-100" />
                <div className="h-4 w-24 rounded-md bg-gray-100" />
                <div className="h-6 w-20 rounded-full bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
