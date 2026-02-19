"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold mb-2">Spending Categories</h2>
            <CategoryList categories={expenseCategories} />
            <div className="pt-3 border-t border-border">
              <CategoryForm type="expense" onSuccess={refresh} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="income" className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold mb-2">Income Categories</h2>
            <CategoryList categories={incomeCategories} />
            <div className="pt-3 border-t border-border">
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
    return <p className="text-sm text-muted-foreground py-4 text-center">No categories yet</p>;
  }

  return (
    <div className="space-y-0.5">
      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted transition-colors">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: cat.color ?? "#6b7280" }}
          />
          <span className="text-sm font-medium flex-1">{cat.name}</span>
          {!cat.is_active && (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>
      ))}
    </div>
  );
}
