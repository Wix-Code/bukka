import FoodCard from "@/components/reusuable/FoodCard";
import { vendors } from "@/components/vendor/MockData";
import VendorHeader from "@/components/vendor/VendorHeader";

export default function VendorPage() {
  const vendor = vendors["mama-grace-kitchen"];

  return (
    <main
      className="
bg-[#fffdf7]
min-h-screen
"
    >
      <VendorHeader vendor={vendor} />

      <section
        className="
max-w-7xl
mx-auto
px-6
py-12
"
      >
        <div
          className="
flex
justify-between
items-center
mb-8
"
        >
          <h2
            className="
text-3xl
font-bold
"
          >
            Today's Menu
          </h2>

          <span
            className="
bg-green-100
text-green-700
px-4
py-2
rounded-full
text-sm
"
          >
            Open Now
          </span>
        </div>

        <div
          className="
grid
sm:grid-cols-2
lg:grid-cols-3
gap-8
"
        >
          {vendor.menu.map((food, index) => (
            <FoodCard key={index} food={food} phone={vendor.phone} />
          ))}
        </div>
      </section>
    </main>
  );
}
