import Link from "next/link";
import type { ReactNode } from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  // Lets each page decide its own URL shape (e.g. preserving other filters
  // in the query string) rather than this component assuming one.
  createPageHref: (page: number) => string;
};

export default function Pagination({
  currentPage,
  totalPages,
  createPageHref,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between px-6 py-4 border-t border-gray-100"
    >
      <PageLink
        href={createPageHref(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Previous
      </PageLink>

      <div className="hidden sm:flex items-center gap-1">
        {pages.map((page, i) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">
              …
            </span>
          ) : (
            <Link
              key={page}
              href={createPageHref(page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition ${
                page === currentPage
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {page}
            </Link>
          ),
        )}
      </div>

      <span className="sm:hidden text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </span>

      <PageLink
        href={createPageHref(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: ReactNode;
}) {
  if (disabled) {
    return (
      <span className="px-4 py-2 rounded-full text-sm font-medium text-gray-300 cursor-not-allowed">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
    >
      {children}
    </Link>
  );
}

// Builds a compact page list like: 1 … 4 5 [6] 7 8 … 24
function getPageNumbers(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  const delta = 1;
  const range: (number | "ellipsis")[] = [];
  const rangeStart = Math.max(2, current - delta);
  const rangeEnd = Math.min(total - 1, current + delta);

  range.push(1);
  if (rangeStart > 2) range.push("ellipsis");
  for (let i = rangeStart; i <= rangeEnd; i++) range.push(i);
  if (rangeEnd < total - 1) range.push("ellipsis");
  if (total > 1) range.push(total);

  return range;
}
