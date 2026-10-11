import CategoriesManager, { CategoryRow } from "@/components/admin-dashboard/category/CategoriesManager";
import { createSupabaseServerClient } from "@/lib/server";

export default async function AdminCategoriesPage() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, created_at")
    .order("name", { ascending: true });

  if (error) console.error("Admin categories query failed:", error.message);

  return (
    <div>
      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">
          Couldn&rsquo;t load categories: {error.message}
          <br />
          <span className="text-red-600/70">
            If it says the table doesn&rsquo;t exist, run
            supabase/categories.sql in the SQL Editor first.
          </span>
        </div>
      )}

      <CategoriesManager initialCategories={(data as CategoryRow[]) ?? []} />
    </div>
  );
}
