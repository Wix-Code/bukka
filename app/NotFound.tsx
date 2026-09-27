import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffdf7] px-6">
      <div className="text-center max-w-sm">
        <span className="font-bold text-xl text-gray-900">Bukka</span>

        <h1 className="mt-8 text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-3 text-gray-600">
          We couldn&rsquo;t find the page you&rsquo;re looking for.
        </p>

        <Link
          href="/"
          className="inline-block mt-8 bg-green-600 text-white px-7 py-3.5 rounded-full font-medium hover:bg-green-700 transition"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
