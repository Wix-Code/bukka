import { ArrowLeft } from "iconsax-react";
import Link from "next/link";

interface Props {
  vendor: {
    name: string;
    description: string;
    location: string;
    openingHours: string;
    image: string;
  };
}

export default function VendorHeader({ vendor }: Props) {
  return (
    <section className="relative h-[420px]">
      <img
        src={vendor.image}
        alt={vendor.name}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      <Link
        href="/"
        className="absolute z-10 flex items-center gap-1 top-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-medium text-gray-900 hover:bg-white transition"
      >
        <ArrowLeft color="#000000" size={18} /> Bukka
      </Link>

      <div className="relative z-10 max-w-7xl mx-auto h-full flex items-end px-6 pb-10 text-white">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold drop-shadow-sm">
            {vendor.name}
          </h1>

          <p className="mt-3 text-lg text-white/85 max-w-xl">
            {vendor.description}
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 text-sm text-white/90">
            <span className="flex items-center gap-1.5">
              📍 {vendor.location}
            </span>
            <span className="flex items-center gap-1.5">
              🕒 {vendor.openingHours}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
