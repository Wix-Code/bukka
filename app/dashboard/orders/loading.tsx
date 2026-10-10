export default function OrdersLoading() {
  return (
    <div
      className="w-full animate-pulse"
      role="status"
      aria-label="Loading orders"
    >
      <span className="sr-only">Loading your orders...</span>

      {/* Page Header */}
      <div className="mb-8 space-y-3">
        <div className="h-7 w-28 rounded-lg bg-gray-200" />
        <div className="h-4 w-64 max-w-full rounded-md bg-gray-100" />
      </div>

      {/* Order Statistics */}
      <div className="mb-8 grid gap-5 sm:grid-cols-1 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-2xl bg-white p-5 shadow-sm">
            {/* Icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <div className="h-5 w-5 rounded-md bg-gray-200" />
            </div>

            {/* Stat Value */}
            <div className="mt-4 h-8 w-24 rounded-lg bg-gray-200" />

            {/* Stat Label */}
            <div className="mt-3 h-4 w-36 rounded-md bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Search and Status Filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="h-12 w-full rounded-full bg-gray-200 sm:max-w-sm" />

        {/* Status Dropdown */}
        <div className="h-12 w-full rounded-full bg-gray-100 sm:w-[220px]" />
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[850px]">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-5 border-b border-gray-100 bg-gray-50/60 px-6 py-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-4 w-16 rounded-md bg-gray-200" />
              ))}
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-6 items-center gap-5 px-6 py-5"
                >
                  {/* Order ID */}
                  <div className="h-4 w-20 rounded-md bg-gray-100" />

                  {/* Item */}
                  <div className="h-4 w-28 rounded-md bg-gray-200" />

                  {/* Customer */}
                  <div className="h-4 w-24 rounded-md bg-gray-100" />

                  {/* Amount */}
                  <div className="h-4 w-20 rounded-md bg-gray-100" />

                  {/* Date */}
                  <div className="h-4 w-24 rounded-md bg-gray-100" />

                  {/* Status */}
                  <div className="h-8 w-24 rounded-full bg-gray-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-4 h-3 w-48 rounded-md bg-gray-100" />
    </div>
  );
}
