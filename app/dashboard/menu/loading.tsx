export default function MenuLoading() {
  return (
    <div
      className="w-full animate-pulse"
      role="status"
      aria-label="Loading menu"
    >
      <span className="sr-only">Loading your menu...</span>

      {/* Page Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <div className="h-7 w-28 rounded-lg bg-gray-200" />
          <div className="h-4 w-40 rounded-md bg-gray-100" />
        </div>

        {/* Add Dish Button */}
        <div className="h-11 w-32 rounded-full bg-gray-200" />
      </div>

      {/* Search Bar */}
      <div className="mb-8 h-12 w-full max-w-sm rounded-full bg-gray-100" />

      {/* Menu Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
          >
            {/* Dish Image */}
            <div className="h-40 w-full bg-gray-200" />

            {/* Dish Information */}
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="h-5 w-32 rounded-md bg-gray-200" />
                <div className="h-5 w-16 rounded-md bg-gray-100" />
              </div>

              {/* Description */}
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full rounded-md bg-gray-100" />
                <div className="h-3 w-3/4 rounded-md bg-gray-100" />
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center gap-2">
                <div className="h-9 flex-1 rounded-full bg-gray-100" />
                <div className="h-9 w-9 rounded-full bg-gray-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
