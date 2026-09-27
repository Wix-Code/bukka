// import type { Metadata } from "next";
// import { notFound } from "next/navigation";
// import VendorHeader from "@/components/vendor/VendorHeader";
// import { getVendorBySlug, getVendorMenu } from "@/lib/vendors";
// import MenuSection from "@/components/reusuable/MenuSection";

// const FALLBACK_COVER_IMAGE =
//   "https://images.unsplash.com/photo-1600891964092-4316c288032e";

// type Props = { params: { slug: string } };

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const vendor = await getVendorBySlug(params.slug);
//   if (!vendor) return {};

//   return {
//     title: `${vendor.name} | Bukka`,
//     description: vendor.description || `Order from ${vendor.name} on Bukka.`,
//   };
// }

// export default async function VendorPage({ params }: Props) {
//   const vendor = await getVendorBySlug(params.slug);
//   if (!vendor) notFound();

//   const dishes = await getVendorMenu(vendor.id);

//   return (
//     <main className="bg-[#fffdf7] min-h-screen">
//       <VendorHeader
//         vendor={{
//           name: vendor.name,
//           description: vendor.description,
//           location: vendor.location,
//           openingHours: vendor.opening_hours,
//           image: vendor.cover_image || FALLBACK_COVER_IMAGE,
//         }}
//       />

//       <MenuSection dishes={dishes} phone={vendor.phone} vendorId={vendor.id} />

//       <footer className="text-center pb-10">
//         <p className="text-xs text-gray-400">Powered by Bukka</p>
//       </footer>
//     </main>
//   );
// }

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VendorHeader from "@/components/vendor/VendorHeader";
import { getVendorBySlug, getVendorMenu } from "@/lib/vendors";
import MenuSection from "@/components/reusuable/MenuSection";

const FALLBACK_COVER_IMAGE =
  "https://images.unsplash.com/photo-1600891964092-4316c288032e";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vendor = await getVendorBySlug(params.slug);
  if (!vendor) return {};

  return {
    title: `${vendor.name} | Bukka`,
    description: vendor.description || `Order from ${vendor.name} on Bukka.`,
  };
}

export default async function VendorPage({ params }: Props) {
  const vendor = await getVendorBySlug(params.slug);
  if (!vendor) notFound();

  const dishes = await getVendorMenu(vendor.id);

  return (
    <main className="bg-[#fffdf7] min-h-screen">
      <VendorHeader
        vendor={{
          name: vendor.name,
          description: vendor.description,
          location: vendor.location,
          openingHours: vendor.opening_hours,
          image: vendor.cover_image || FALLBACK_COVER_IMAGE,
        }}
      />

      <MenuSection dishes={dishes} phone={vendor.phone} vendorId={vendor.id} />

      <footer className="text-center pb-10">
        <p className="text-xs text-gray-400">Powered by Bukka</p>
      </footer>
    </main>
  );
}