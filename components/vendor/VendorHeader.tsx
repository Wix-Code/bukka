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
    <section
      className="
relative
h-[420px]
"
    >
      <img
        src={vendor.image}
        alt={vendor.name}
        className="
absolute
inset-0
w-full
h-full
object-cover
"
      />

      <div
        className="
absolute
inset-0
bg-black/50
"
      />

      <div
        className="
relative
z-10
max-w-7xl
mx-auto
h-full
flex
items-end
px-6
pb-10
text-white
"
      >
        <div>
          <h1
            className="
text-4xl
md:text-5xl
font-bold
"
          >
            {vendor.name}
          </h1>

          <p
            className="
mt-3
text-lg
"
          >
            {vendor.description}
          </p>

          <div
            className="
flex
gap-5
mt-5
text-sm
"
          >
            <span>📍 {vendor.location}</span>

            <span>🕒 {vendor.openingHours}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
