"use client";

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { formatMoney } from "@/lib/currency";
import { formatDate } from "@/lib/dates";
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
      <div className="stats stats-horizontal shadow-sm border border-base-300 w-full">
        <div className="stat py-2 px-4">
          <div className="stat-title text-xs">Total Rows</div>
          <div className="stat-value text-lg">{stats.total}</div>
        </div>
        <div className="stat py-2 px-4">
          <div className="stat-title text-xs">Importing</div>
          <div className="stat-value text-lg text-primary">{stats.selected}</div>
        </div>
        {stats.duplicates > 0 && (
          <div className="stat py-2 px-4">
            <div className="stat-title text-xs">Duplicates</div>
            <div className="stat-value text-lg text-warning">{stats.duplicates}</div>
          </div>
        )}
        <div className="stat py-2 px-4">
          <div className="stat-title text-xs">Net Amount</div>
          <div className={`stat-value text-lg ${stats.netAmount >= 0 ? "text-success" : "text-error"}`}>
            {formatMoney(stats.netAmount, currency)}
          </div>
        </div>
      </div>

      {/* Default category selector */}
      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-sm font-medium">Default Category</span>
          <span className="label-text-alt text-xs text-neutral">Applied to all rows</span>
        </label>
        <select
          className="select select-bordered select-sm"
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
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto border border-base-300 rounded-box">
        <table className="table table-xs table-pin-rows">
          <thead>
            <tr>
              <th className="w-8">
                <input
                  type="checkbox"
                  className="checkbox checkbox-xs checkbox-primary"
                  checked={allSelected}
                  onChange={onToggleAll}
                />
              </th>
              <th>Date</th>
              <th>Description</th>
              <th className="text-right">Amount</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`${row.isDuplicate ? "opacity-60" : ""} ${
                  !selectedRows.has(i) ? "opacity-40" : ""
                }`}
              >
                <td>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs checkbox-primary"
                    checked={selectedRows.has(i)}
                    onChange={() => onToggleRow(i)}
                  />
                </td>
                <td className="font-mono text-xs whitespace-nowrap">
                  {formatDate(row.date)}
                </td>
                <td className="text-xs max-w-[250px] truncate">
                  {row.description}
                </td>
                <td className={`text-right font-mono text-xs whitespace-nowrap ${
                  row.amountCents >= 0 ? "text-success" : "text-error"
                }`}>
                  {formatMoney(row.amountCents, currency)}
                </td>
                <td>
                  {row.isDuplicate && (
                    <div className="tooltip tooltip-left" data-tip="Possible duplicate">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
