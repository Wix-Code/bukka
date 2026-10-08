export default function OrdersLoading() {
  return (
    <div className="animate-pulse">
      {/* HEADER */}
      <div className="mb-8">
        <div className="h-7 w-32 rounded-lg bg-gray-200" />

        <div className="mt-3 h-4 w-80 max-w-full rounded bg-gray-100" />
      </div>

      {/* STATS */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 w-24 rounded bg-gray-100" />

                <div className="mt-3 h-7 w-14 rounded bg-gray-200" />
              </div>

              <div className="h-11 w-11 rounded-xl bg-gray-100" />
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="h-11 w-full rounded-full bg-gray-100 sm:max-w-sm" />

        <div className="h-11 w-full rounded-full bg-gray-100 sm:w-[220px]" />
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <div className="grid grid-cols-7 gap-4">
            {Array.from({
              length: 7,
            }).map((_, index) => (
              <div key={index} className="h-4 rounded bg-gray-200" />
            ))}
          </div>
        </div>

        {Array.from({
          length: 7,
        }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-7 gap-4 border-b border-gray-100 px-6 py-5"
          >
            {Array.from({
              length: 7,
            }).map((_, column) => (
              <div key={column} className="h-4 rounded bg-gray-100" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
