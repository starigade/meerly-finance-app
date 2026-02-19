"use client";

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { formatMoney } from "@/lib/currency";
import { formatDate } from "@/lib/dates";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CsvParsedRow, Category } from "@/lib/types";

interface CsvPreviewTableProps {
  rows: CsvParsedRow[];
  currency: string;
  selectedRows: Set<number>;
  onToggleRow: (index: number) => void;
  onToggleAll: () => void;
  defaultCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  categories: Category[];
}

export function CsvPreviewTable({
  rows,
  currency,
  selectedRows,
  onToggleRow,
  onToggleAll,
  defaultCategoryId,
  onCategoryChange,
  categories,
}: CsvPreviewTableProps) {
  const stats = useMemo(() => {
    const selected = rows.filter((_, i) => selectedRows.has(i));
    const duplicates = rows.filter((r) => r.isDuplicate).length;
    const netAmount = selected.reduce((sum, r) => sum + r.amountCents, 0);
    return {
      total: rows.length,
      selected: selected.length,
      duplicates,
      netAmount,
    };
  }, [rows, selectedRows]);

  const expenseCategories = categories.filter((c) => c.category_type === "expense" && c.is_active);
  const incomeCategories = categories.filter((c) => c.category_type === "income" && c.is_active);
  const allSelected = rows.length > 0 && selectedRows.size === rows.length;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex gap-3 w-full">
        <Card className="flex-1">
          <CardContent className="px-4 py-2">
            <div className="text-xs text-muted-foreground">Total Rows</div>
            <div className="text-lg font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="px-4 py-2">
            <div className="text-xs text-muted-foreground">Importing</div>
            <div className="text-lg font-bold text-primary">{stats.selected}</div>
          </CardContent>
        </Card>
        {stats.duplicates > 0 && (
          <Card className="flex-1">
            <CardContent className="px-4 py-2">
              <div className="text-xs text-muted-foreground">Duplicates</div>
              <div className="text-lg font-bold text-warning">{stats.duplicates}</div>
            </CardContent>
          </Card>
        )}
        <Card className="flex-1">
          <CardContent className="px-4 py-2">
            <div className="text-xs text-muted-foreground">Net Amount</div>
            <div className={`text-lg font-bold ${stats.netAmount >= 0 ? "text-success" : "text-destructive"}`}>
              {formatMoney(stats.netAmount, currency)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Default category selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Default Category</Label>
          <span className="text-xs text-muted-foreground">Applied to all rows</span>
        </div>
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={defaultCategoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="" disabled>Select category</option>
          <optgroup label="Expense">
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </optgroup>
          <optgroup label="Income">
            {incomeCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Table */}
      <TooltipProvider>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8 h-8">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={onToggleAll}
                    className="h-3.5 w-3.5"
                  />
                </TableHead>
                <TableHead className="h-8 text-xs">Date</TableHead>
                <TableHead className="h-8 text-xs">Description</TableHead>
                <TableHead className="h-8 text-xs text-right">Amount</TableHead>
                <TableHead className="w-8 h-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow
                  key={i}
                  className={`${row.isDuplicate ? "opacity-60" : ""} ${
                    !selectedRows.has(i) ? "opacity-40" : ""
                  }`}
                >
                  <TableCell className="py-1.5">
                    <Checkbox
                      checked={selectedRows.has(i)}
                      onCheckedChange={() => onToggleRow(i)}
                      className="h-3.5 w-3.5"
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs whitespace-nowrap py-1.5">
                    {formatDate(row.date)}
                  </TableCell>
                  <TableCell className="text-xs max-w-[250px] truncate py-1.5">
                    {row.description}
                  </TableCell>
                  <TableCell className={`text-right font-mono text-xs whitespace-nowrap py-1.5 ${
                    row.amountCents >= 0 ? "text-success" : "text-destructive"
                  }`}>
                    {formatMoney(row.amountCents, currency)}
                  </TableCell>
                  <TableCell className="py-1.5">
                    {row.isDuplicate && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          Possible duplicate
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TooltipProvider>
    </div>
  );
}
