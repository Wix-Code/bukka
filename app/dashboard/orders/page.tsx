const orders = [
  {
    id: "BK-1042",
    customer: "Ada O.",
    item: "Jollof Rice & Chicken",
    amount: 3500,
    status: "Pending",
    time: "10 mins ago",
  },
  {
    id: "BK-1041",
    customer: "Femi A.",
    item: "Pepper Soup",
    amount: 4200,
    status: "Completed",
    time: "1 hr ago",
  },
  {
    id: "BK-1040",
    customer: "Chidera N.",
    item: "Fried Rice",
    amount: 3000,
    status: "Completed",
    time: "3 hrs ago",
  },
  {
    id: "BK-1039",
    customer: "Tunde B.",
    item: "Suya Platter",
    amount: 5000,
    status: "Cancelled",
    time: "Yesterday",
  },
];

const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-50 text-yellow-700",
  Completed: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-700",
};

export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Orders</h1>
      <p className="text-sm text-gray-500 mb-8">
        All orders placed through your menu.
      </p>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Item</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{order.customer}</td>
                  <td className="px-6 py-4 text-gray-600">{order.item}</td>
                  <td className="px-6 py-4 text-gray-900">
                    ₦{order.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        statusStyles[order.status]
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
