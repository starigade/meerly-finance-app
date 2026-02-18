export const dynamic = "force-dynamic";

import { getCategories } from "@/lib/actions";
import { CategoriesClient } from "./categories-client";

export default async function CategoriesPage() {
  const categories = await getCategories();
  const incomeCategories = categories.filter((c) => c.category_type === "income");
  const expenseCategories = categories.filter((c) => c.category_type === "expense");

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h1 className="text-lg font-semibold">Categories</h1>
      <CategoriesClient
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
      />
    </div>
  );
}
