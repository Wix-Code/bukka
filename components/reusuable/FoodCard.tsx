type FoodProps = {
  phone?: string;
  food: {
    name: string;
    description: string;
    price: number;
    image: string;
    phone?: string;
  };
};

export default function FoodCard({ food, phone }: FoodProps) {
  const orderPhone = food.phone ?? phone;

  const whatsappHref = orderPhone
    ? `https://wa.me/${orderPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hi, I'd like to order: ${food.name} — ₦${food.price.toLocaleString()}`,
      )}`
    : undefined;

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-52 overflow-hidden">
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900">{food.name}</h3>

        <p className="mt-1.5 text-gray-500 text-sm leading-relaxed line-clamp-2">
          {food.description}
        </p>

        <div className="flex justify-between items-center mt-5">
          <span className="font-bold text-green-600 text-lg">
            ₦{food.price.toLocaleString()}
          </span>

          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-green-700 active:scale-95 transition"
            >
              Order
            </a>
          ) : (
            <button
              disabled
              className="bg-gray-100 text-gray-400 px-6 py-2.5 rounded-full text-sm font-medium cursor-not-allowed"
            >
              Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
