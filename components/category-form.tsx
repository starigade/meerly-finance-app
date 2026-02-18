"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCategory } from "@/lib/actions";
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
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const result = await createCategory({
      name: name.trim(),
      category_type: type,
      color,
    });

    if (result.success) {
      toast.success(`${name} added`);
      setName("");
      onSuccess?.();
    } else {
      toast.error(result.error ?? "Failed to create category");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1 space-y-1">
        <Label className="text-xs">Name</Label>
        <Input
          placeholder={`New ${type} category`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Color</Label>
        <div className="flex gap-1 flex-wrap max-w-[200px]">
          {COLORS.slice(0, 8).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-md transition-all ${
                color === c ? "ring-2 ring-offset-1 ring-gray-400 scale-110" : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        Add
      </Button>
    </form>
  );
}
