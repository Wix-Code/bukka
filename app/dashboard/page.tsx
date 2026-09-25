import Link from "next/link";
import { ShoppingBag, Users, Utensils, TrendingUp, Plus } from "lucide-react";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-[#fffdf7] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}

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
              Good Morning, Mama Grace 👋
            </h1>

            <p
              className="
text-gray-500
mt-2
"
            >
              Here is your business overview today.
            </p>
          </div>

          <button
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
          </button>
        </div>

        {/* Stats */}

        <div
          className="
grid
md:grid-cols-4
gap-6
"
        >
          <StatCard
            title="Today's Sales"
            value="₦54,000"
            icon={<TrendingUp />}
          />

          <StatCard title="Orders" value="24" icon={<ShoppingBag />} />

          <StatCard title="Customers" value="180" icon={<Users />} />

          <StatCard title="Menu Items" value="35" icon={<Utensils />} />
        </div>

        {/* Menu Management */}

        <section className="mt-12">
          <div
            className="
bg-white
rounded-3xl
p-6
shadow-sm
border
"
          >
            <div
              className="
flex
justify-between
items-center
mb-6
"
            >
              <h2
                className="
text-2xl
font-bold
"
              >
                Menu Management
              </h2>

              <button
                className="
text-green-600
font-semibold
"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              <MenuItem
                name="Jollof Rice Special"
                price="₦2,500"
                status="Available"
              />

              <MenuItem
                name="Amala Special"
                price="₦2,000"
                status="Available"
              />

              <MenuItem
                name="Peppered Chicken"
                price="₦1,500"
                status="Out of Stock"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="
bg-white
p-6
rounded-3xl
border
shadow-sm
"
    >
      <div
        className="
text-green-600
mb-4
"
      >
        {icon}
      </div>

      <h3
        className="
text-gray-500
text-sm
"
      >
        {title}
      </h3>

      <p
        className="
text-3xl
font-bold
mt-2
"
      >
        {value}
      </p>
    </div>
  );
}

function MenuItem({
  name,
  price,
  status,
}: {
  name: string;
  price: string;
  status: string;
}) {
  return (
    <div
      className="
flex
justify-between
items-center
bg-gray-50
rounded-2xl
p-4
"
    >
      <div>
        <h3
          className="
font-semibold
"
        >
          {name}
        </h3>

        <p
          className="
text-green-600
font-bold
"
        >
          {price}
        </p>
      </div>

      <span
        className={`
px-3
py-1
rounded-full
text-sm

${
  status === "Available"
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700"
}

`}
      >
        {status}
      </span>
    </div>
  );
}
