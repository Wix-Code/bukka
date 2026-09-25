export default function AddMeal() {
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
max-w-3xl
mx-auto
bg-white
rounded-3xl
p-8
shadow
"
      >
        <h1
          className="
text-3xl
font-bold
mb-8
"
        >
          Add New Meal
        </h1>

        <form
          className="
space-y-5
"
        >
          <input placeholder="Meal name" className="input" />

          <textarea placeholder="Description" className="input" />

          <input placeholder="Price" type="number" className="input" />

          <select className="input">
            <option>Breakfast</option>

            <option>Lunch</option>

            <option>Dinner</option>
          </select>

          <input type="file" />

          <button
            className="
bg-green-600
text-white
px-8
py-3
rounded-full
"
          >
            Save Meal
          </button>
        </form>
      </div>
    </main>
  );
}
