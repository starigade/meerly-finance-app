"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/currency";
import { formatDate } from "@/lib/dates";
import { TRANSACTION_TYPE_LABELS } from "@/lib/constants";
import { deleteTransaction } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: any[];
  showDelete?: boolean;
}

export function TransactionList({ transactions, showDelete = true }: TransactionListProps) {
  const router = useRouter();

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">No transactions found</p>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    const result = await deleteTransaction(id);
    if (result.success) {
      toast.success("Transaction deleted");
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to delete");
    }
  };

  // Get display info from transaction entries
  const getDisplayInfo = (txn: any) => {
    const entries = txn.transaction_entries ?? txn.entries ?? [];
    const categoryEntry = entries.find((e: any) => e.category);
    const accountEntry = entries.find((e: any) => e.account);
    const positiveEntry = entries.find((e: any) => e.amount > 0);

    const category = categoryEntry?.category;
    const amount = positiveEntry?.amount ?? entries[0]?.amount ?? 0;
    const currency = entries[0]?.currency ?? "SGD";

    let displayAmount = Math.abs(amount);
    let isExpense = txn.ui_type === "expense";

    return { category, displayAmount, currency, isExpense };
  };

  return (
    <div className="divide-y divide-surface-tertiary">
      {transactions.map((txn) => {
        const { category, displayAmount, currency, isExpense } = getDisplayInfo(txn);

        return (
          <div
            key={txn.id}
            className="flex items-center gap-3 py-3 hover:bg-surface-secondary transition-colors rounded-lg px-2 -mx-2"
          >
            {/* Color dot */}
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full flex-shrink-0",
                isExpense ? "bg-danger" : "bg-success"
              )}
              style={category?.color ? { backgroundColor: category.color } : undefined}
            />

            {/* Details */}
            <Link href={`/transactions/${txn.id}`} className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">
                {txn.description || category?.name || TRANSACTION_TYPE_LABELS[txn.ui_type]}
              </p>
              <p className="text-xs text-muted">
                {formatDate(txn.date)}
                {category && <> &middot; {category.name}</>}
              </p>
            </Link>

            {/* Amount */}
            <span
              className={cn(
                "font-semibold text-sm whitespace-nowrap",
                isExpense ? "text-danger" : "text-success"
              )}
            >
              {isExpense ? "-" : "+"}
              {formatMoney(displayAmount, currency)}
            </span>

            {/* Delete */}
            {showDelete && (
              <button
                onClick={() => handleDelete(txn.id)}
                className="p-1.5 text-muted hover:text-danger rounded-lg hover:bg-danger-light transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
