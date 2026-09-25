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
  return (
    <div
      className="
bg-white 
rounded-3xl 
overflow-hidden
border border-[#d7d7d7]
transition
"
    >
      <img
        src={food.image}
        alt={food.name}
        className="
w-full
h-52
object-cover
"
      />

      <div className="p-5">
        <h3
          className="
text-xl 
font-bold
"
        >
          {food.name}
        </h3>

        <p
          className="
text-gray-500
mt-2
"
        >
          {food.description}
        </p>

        <div
          className="
flex 
justify-between
items-center
mt-5
"
        >
          <span
            className="
font-bold
text-green-600 text-[18px]
"
          >
            ₦{food.price.toLocaleString()}
          </span>

          <button
            className="
bg-green-600
text-white
px-6
py-2
rounded-[16px]
text-[16px]
"
          >
            Order
          </button>
        </div>
      </div>
    </div>
  );
}
