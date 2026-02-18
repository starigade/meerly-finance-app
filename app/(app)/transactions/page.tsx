export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { TransactionList } from "@/components/transaction-list";
import { getTransactions, getAccounts, getCategories } from "@/lib/actions";
import { QuickAdd } from "@/components/quick-add";
import { TransactionsFilter } from "./transactions-filter";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const [transactions, accounts, categories] = await Promise.all([
    getTransactions({
      search: params.search,
      startDate: params.start,
      endDate: params.end,
      limit: 50,
    }),
    getAccounts(),
    getCategories(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h1 className="text-lg font-semibold whitespace-nowrap">
            Transactions
            <span className="text-neutral font-normal text-sm ml-2">({transactions.length})</span>
          </h1>
          <div className="flex-1 max-w-sm hidden sm:block">
            <TransactionsFilter />
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/import" className="btn btn-ghost btn-sm">
            <Upload className="h-4 w-4" />
            Import
          </Link>
          <Link href="/transactions/new" className="btn btn-primary btn-sm">
            <Plus className="h-4 w-4" />
            Add
          </Link>
        </div>
      </div>

      <div className="sm:hidden">
        <TransactionsFilter />
      </div>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-0">
          <TransactionList transactions={transactions} />
        </div>
      </div>

      <QuickAdd accounts={accounts} categories={categories} />
    </div>
  );
}
