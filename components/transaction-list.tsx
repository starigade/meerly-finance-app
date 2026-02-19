"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/currency";
import { formatDate } from "@/lib/dates";
import { TRANSACTION_TYPE_LABELS } from "@/lib/constants";
import { deleteTransaction } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

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
        <p className="text-muted-foreground text-sm">No transactions found</p>
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
    <Table>
      {!compact && (
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs font-medium">Description</TableHead>
            <TableHead className="text-xs font-medium hidden sm:table-cell">Date</TableHead>
            <TableHead className="text-xs font-medium hidden md:table-cell">Category</TableHead>
            <TableHead className="text-xs font-medium text-right">Amount</TableHead>
            {showDelete && <TableHead className="w-8"></TableHead>}
          </TableRow>
        </TableHeader>
      )}
      <TableBody>
        {transactions.map((txn) => {
          const { category, displayAmount, currency, isExpense } = getDisplayInfo(txn);

          return (
            <TableRow key={txn.id}>
              <TableCell>
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
                        <p className="text-xs text-muted-foreground">
                          {formatDate(txn.date)}
                          {category && <> &middot; {category.name}</>}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </TableCell>
              {!compact && (
                <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                  {formatDate(txn.date)}
                </TableCell>
              )}
              {!compact && (
                <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                  {category?.name ?? "-"}
                </TableCell>
              )}
              <TableCell className="text-right">
                <span className={`font-mono tabular-nums text-sm font-medium ${isExpense ? "text-destructive" : "text-success"}`}>
                  {isExpense ? "-" : "+"}
                  {formatMoney(displayAmount, currency)}
                </span>
              </TableCell>
              {showDelete && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(txn.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
