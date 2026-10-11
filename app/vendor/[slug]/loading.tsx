export default function VendorLoading() {
  return (
    <main className="min-h-screen bg-[#fffdf7] animate-pulse">
      {/* Vendor Header Skeleton */}
      <div className="relative h-[280px] sm:h-[350px] bg-gray-200">
        <div className="absolute bottom-8 left-6 right-6 mx-auto max-w-7xl">
          <div className="h-9 w-64 rounded-lg bg-gray-300 mb-4" />
          <div className="h-4 w-80 max-w-full rounded bg-gray-300 mb-3" />
          <div className="h-4 w-44 rounded bg-gray-300" />
        </div>
      </div>

      {/* Menu Skeleton */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="h-9 w-48 rounded-lg bg-gray-200 mb-3" />
            <div className="h-4 w-20 rounded bg-gray-200" />
          </div>

          <div className="h-9 w-24 rounded-full bg-gray-200" />
        </div>

        {/* Search + Category */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-2xl">
          <div className="h-12 rounded-full bg-gray-200" />
          <div className="h-12 rounded-2xl bg-gray-200" />
        </div>

        {/* Dish Cards */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl bg-white shadow-sm"
            >
              <div className="h-48 bg-gray-200" />

              <div className="space-y-4 p-5">
                <div className="h-6 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-full rounded bg-gray-100" />
                <div className="h-4 w-2/3 rounded bg-gray-100" />

                <div className="flex items-center justify-between pt-3">
                  <div className="h-6 w-24 rounded bg-gray-200" />
                  <div className="h-10 w-28 rounded-full bg-green-100" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="mt-10 flex justify-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200" />
          <div className="h-10 w-10 rounded-full bg-gray-200" />
          <div className="h-10 w-10 rounded-full bg-gray-200" />
        </div>
      </section>
    </main>
  );
}
