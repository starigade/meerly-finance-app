"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { createCategory } from "@/lib/actions";
import { categoryFormSchema, type CategoryFormValues } from "@/lib/schemas";
import { toast } from "sonner";
import type { CategoryType } from "@/lib/types";

const COLORS = [
  "#dc2626", "#ea580c", "#d97706", "#ca8a04", "#65a30d",
  "#16a34a", "#059669", "#0d9488", "#0891b2", "#0ea5e9",
  "#2563eb", "#4f46e5", "#7c3aed", "#9333ea", "#c026d3",
  "#e11d48", "#be185d", "#f472b6",
];

export function CategoryForm({
  type,
  onSuccess,
}: {
  type: CategoryType;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      color: COLORS[0],
    },
  });

  const selectedColor = form.watch("color");

  const onSubmit = async (values: CategoryFormValues) => {
    setLoading(true);
    const result = await createCategory({
      name: values.name.trim(),
      category_type: type,
      color: values.color,
    });

    if (result.success) {
      toast.success(`${values.name} added`);
      form.reset();
      onSuccess?.();
    } else {
      toast.error(result.error ?? "Failed to create category");
    }
    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="text-xs">Name</FormLabel>
              <FormControl>
                <Input placeholder={`New ${type} category`} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Color</FormLabel>
              <div className="flex gap-1 flex-wrap max-w-[200px]">
                {COLORS.slice(0, 8).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => field.onChange(c)}
                    className={`w-6 h-6 rounded-md transition-all ${
                      selectedColor === c ? "ring-2 ring-offset-1 ring-foreground/30 scale-110" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="sm" disabled={loading}>
          Add
        </Button>
      </form>
    </Form>
  );
}
