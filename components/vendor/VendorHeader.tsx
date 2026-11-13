import { ArrowLeft } from "iconsax-react";
import Link from "next/link";
import { formatOpeningHours } from "@/lib/formatOpeningHours";

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
  const openingHours = formatOpeningHours(vendor.openingHours);

  return (
    <section className="relative h-[420px]">
      <img
        src={vendor.image}
        alt={vendor.name}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      <Link
        href="/"
        className="absolute z-10 top-6 left-6 flex items-center gap-1 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-900 backdrop-blur transition hover:bg-white"
      >
        <ArrowLeft color="#000000" size={18} />
        Bukka
      </Link>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-6 pb-10 text-white">
        <div>
          <h1 className="text-4xl font-bold drop-shadow-sm md:text-5xl">
            {vendor.name}
          </h1>

          <p className="mt-3 max-w-xl text-lg text-white/85">
            {vendor.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/90">
            <span className="flex items-center gap-1.5">
              📍 {vendor.location}
            </span>

            <span className="flex items-center gap-1.5">🕒 {openingHours}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
