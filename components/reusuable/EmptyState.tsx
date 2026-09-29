import Link from "next/link";
import type { ReactNode } from "react";

type Action =
  | { label: string; href: string; onClick?: never }
  | { label: string; onClick: () => void; href?: never };

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: Action;
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-300 flex items-center justify-center mb-4">
          {icon}
        </div>
      )}

      <p className="font-bold text-gray-900">{title}</p>

      {description && (
        <p className="mt-1.5 text-sm text-gray-500 max-w-xs">{description}</p>
      )}

      {action &&
        (action.href ? (
          <Link
            href={action.href}
            className="mt-5 bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-green-700 transition"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="mt-5 bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-green-700 transition"
          >
            {action.label}
          </button>
        ))}
    </div>
  );
}
