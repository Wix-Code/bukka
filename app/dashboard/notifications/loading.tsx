export default function NotificationsLoading() {
  return (
    <div
      className="w-full animate-pulse"
      role="status"
      aria-label="Loading notifications"
    >
      <span className="sr-only">Loading your notifications...</span>

      {/* Page Header */}
      <div className="mb-8 space-y-3">
        <div className="h-7 w-44 rounded-lg bg-gray-200" />
        <div className="h-4 w-52 rounded-md bg-gray-100" />
      </div>

      {/* Notifications Container */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {/* Notification Rows */}
        <div className="divide-y divide-gray-50">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className={`flex items-start justify-between gap-4 px-6 py-4 ${
                index < 3 ? "bg-green-50/40" : ""
              }`}
            >
              <div className="flex-1 space-y-3">
                {/* Notification Title */}
                <div
                  className={`h-4 rounded-md bg-gray-200 ${
                    index % 3 === 0 ? "w-52" : index % 3 === 1 ? "w-40" : "w-60"
                  } max-w-full`}
                />

                {/* Price and Timestamp */}
                <div className="flex items-center gap-2">
                  <div className="h-3 w-20 rounded-md bg-gray-100" />
                  <div className="h-3 w-2 rounded-full bg-gray-100" />
                  <div className="h-3 w-14 rounded-md bg-gray-100" />
                </div>
              </div>

              {/* Unread Indicator */}
              {index < 3 && (
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-200" />
              )}
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-gray-100 px-6 py-5">
          <div className="h-9 w-20 rounded-full bg-gray-100" />

          <div className="h-9 w-9 rounded-lg bg-gray-200" />
          <div className="h-9 w-9 rounded-lg bg-gray-100" />
          <div className="h-9 w-9 rounded-lg bg-gray-100" />

          <div className="h-9 w-20 rounded-full bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
