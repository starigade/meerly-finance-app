"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryForm } from "@/components/category-form";
import type { Category } from "@/lib/types";

export function CategoriesClient({
  incomeCategories,
  expenseCategories,
}: {
  incomeCategories: Category[];
  expenseCategories: Category[];
}) {
  const router = useRouter();

  const refresh = () => router.refresh();

  return (
    <Tabs defaultValue="expense">
      <TabsList className="w-full">
        <TabsTrigger value="expense" className="flex-1">
          Spending ({expenseCategories.length})
        </TabsTrigger>
        <TabsTrigger value="income" className="flex-1">
          Income ({incomeCategories.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="expense" className="space-y-4">
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-4">
            <h2 className="text-sm font-semibold mb-2">Spending Categories</h2>
            <CategoryList categories={expenseCategories} />
            <div className="pt-3 border-t border-base-300">
              <CategoryForm type="expense" onSuccess={refresh} />
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="income" className="space-y-4">
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-4">
            <h2 className="text-sm font-semibold mb-2">Income Categories</h2>
            <CategoryList categories={incomeCategories} />
            <div className="pt-3 border-t border-base-300">
              <CategoryForm type="income" onSuccess={refresh} />
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function CategoryList({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return <p className="text-sm text-neutral py-4 text-center">No categories yet</p>;
  }

  return (
    <div className="space-y-0.5">
      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-base-200 transition-colors">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: cat.color ?? "#6b7280" }}
          />
          <span className="text-sm font-medium flex-1">{cat.name}</span>
          {!cat.is_active && (
            <span className="badge badge-ghost badge-sm">Inactive</span>
          )}
        </div>
      ))}
    </div>
  );
}
