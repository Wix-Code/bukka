import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { menuItems } from "@/components/vendor/MockData";

export default function MenuPage() {
  return (
    <main
      className="
min-h-screen
bg-[#fffdf7]
p-6
"
    >
      <div
        className="
max-w-7xl
mx-auto
"
      >
        <div
          className="
flex
justify-between
items-center
mb-10
"
        >
          <div>
            <h1
              className="
text-3xl
font-bold
"
            >
              Menu Management
            </h1>

            <p
              className="
text-gray-500
mt-2
"
            >
              Update your daily food offerings
            </p>
          </div>

          <Link
            href="/dashboard/menu/new"
            className="
bg-green-600
text-white
px-5
py-3
rounded-full
flex
items-center
gap-2
"
          >
            <Plus size={18} />
            Add Meal
          </Link>
        </div>

        <div
          className="
grid
md:grid-cols-2
lg:grid-cols-3
gap-8
"
        >
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="
bg-white
rounded-3xl
overflow-hidden
shadow-sm
border
"
            >
              <img
                src={item.image}
                alt={item.name}
                className="
h-52
w-full
object-cover
"
              />

              <div className="p-5">
                <h2
                  className="
text-xl
font-bold
"
                >
                  {item.name}
                </h2>

                <p
                  className="
text-gray-500
text-sm
mt-2
"
                >
                  {item.description}
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
text-green-600
"
                  >
                    ₦{item.price.toLocaleString()}
                  </span>

                  <span
                    className={`
px-3
py-1
rounded-full
text-sm

${item.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}

`}
                  >
                    {item.available ? "Available" : "Unavailable"}
                  </span>
                </div>

                <div
                  className="
flex
gap-3
mt-5
"
                >
                  <button
                    className="
flex-1
border
rounded-full
py-2
flex
justify-center
items-center
gap-2
"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    className="
flex-1
bg-red-50
text-red-600
rounded-full
py-2
flex
justify-center
items-center
gap-2
"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
