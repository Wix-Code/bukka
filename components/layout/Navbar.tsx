import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl md:hidden flex items-center font-bold text-green-600 whitespace-nowrap"
        >
          <img className="w-[80px]" src={"/images/logo.png"} />
        </Link>
        <Link
          href="/"
          className="text-2xl hidden md:flex items-center font-bold text-green-600 whitespace-nowrap"
        >
          <img className="w-[80px]" src={"/images/logo.png"} />
          BukaOnline
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
          <Link
            href="#how-it-works"
            className="hover:text-green-600 transition"
          >
            How it works
          </Link>

          <Link href="#pricing" className="hover:text-green-600 transition">
            Pricing
          </Link>

          <Link href="#vendors" className="hover:text-green-600 transition">
            For Vendors
          </Link>
        </div>

        {/* CTA Button */}
        <Link
          href={"/login"}
          className="
          bg-green-600 
          hover:bg-green-700 
          text-white 
          px-4 sm:px-6 
          py-2.5 
          rounded-full 
          text-sm sm:text-base
          font-medium
          transition
          shadow-md
          "
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}
