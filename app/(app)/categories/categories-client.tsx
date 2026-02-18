"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spending Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CategoryList categories={expenseCategories} />
            <div className="pt-2 border-t border-surface-tertiary">
              <CategoryForm type="expense" onSuccess={refresh} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="income" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Income Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CategoryList categories={incomeCategories} />
            <div className="pt-2 border-t border-surface-tertiary">
              <CategoryForm type="income" onSuccess={refresh} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function CategoryList({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return <p className="text-sm text-muted py-4 text-center">No categories yet</p>;
  }

  return (
    <div className="space-y-1">
      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-surface-secondary transition-colors">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: cat.color ?? "#6b7280" }}
          />
          <span className="text-sm font-medium text-gray-900 flex-1">{cat.name}</span>
          {!cat.is_active && (
            <span className="text-xs text-muted bg-surface-secondary px-2 py-0.5 rounded-full">
              Inactive
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
