"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/currency";
import { formatDate } from "@/lib/dates";
import { TRANSACTION_TYPE_LABELS } from "@/lib/constants";
import { deleteTransaction } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TransactionListProps {
  transactions: any[];
  showDelete?: boolean;
  compact?: boolean;
}

export function TransactionList({ transactions, showDelete = true, compact = false }: TransactionListProps) {
  const router = useRouter();

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral text-sm">No transactions found</p>
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

  const getDisplayInfo = (txn: any) => {
    const entries = txn.transaction_entries ?? txn.entries ?? [];
    const categoryEntry = entries.find((e: any) => e.category);
    const accountEntry = entries.find((e: any) => e.account);
    const positiveEntry = entries.find((e: any) => e.amount > 0);

    const category = categoryEntry?.category;
    const amount = positiveEntry?.amount ?? entries[0]?.amount ?? 0;
    const currency = entries[0]?.currency ?? "SGD";

    const displayAmount = Math.abs(amount);
    const isExpense = txn.ui_type === "expense";

    return { category, displayAmount, currency, isExpense };
  };

  return (
    <table className={`table ${compact ? "table-sm" : ""}`}>
      {!compact && (
        <thead>
          <tr>
            <th className="text-xs font-medium text-neutral">Description</th>
            <th className="text-xs font-medium text-neutral hidden sm:table-cell">Date</th>
            <th className="text-xs font-medium text-neutral hidden md:table-cell">Category</th>
            <th className="text-xs font-medium text-neutral text-right">Amount</th>
            {showDelete && <th className="w-8"></th>}
          </tr>
        </thead>
      )}
      <tbody>
        {transactions.map((txn) => {
          const { category, displayAmount, currency, isExpense } = getDisplayInfo(txn);

          return (
            <tr key={txn.id} className="hover">
              <td>
                <Link href={`/transactions/${txn.id}`} className="hover:text-primary">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={category?.color ? { backgroundColor: category.color } : undefined}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {txn.description || category?.name || TRANSACTION_TYPE_LABELS[txn.ui_type]}
                      </p>
                      {compact && (
                        <p className="text-xs text-neutral">
                          {formatDate(txn.date)}
                          {category && <> &middot; {category.name}</>}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </td>
              {!compact && (
                <td className="text-sm text-neutral hidden sm:table-cell">
                  {formatDate(txn.date)}
                </td>
              )}
              {!compact && (
                <td className="text-sm text-neutral hidden md:table-cell">
                  {category?.name ?? "-"}
                </td>
              )}
              <td className="text-right">
                <span className={`font-mono tabular-nums text-sm font-medium ${isExpense ? "text-error" : "text-success"}`}>
                  {isExpense ? "-" : "+"}
                  {formatMoney(displayAmount, currency)}
                </span>
              </td>
              {showDelete && (
                <td>
                  <button
                    onClick={() => handleDelete(txn.id)}
                    className="btn btn-ghost btn-xs text-neutral hover:text-error"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
