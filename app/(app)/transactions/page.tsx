export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { TransactionList } from "@/components/transaction-list";
import { getTransactions, getAccounts, getCategories } from "@/lib/actions";
import { QuickAdd } from "@/components/quick-add";
import { TransactionsFilter } from "./transactions-filter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
            <span className="text-muted-foreground font-normal text-sm ml-2">({transactions.length})</span>
          </h1>
          <div className="flex-1 max-w-sm hidden sm:block">
            <TransactionsFilter />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/import">
              <Upload className="h-4 w-4" />
              Import
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/transactions/new">
              <Plus className="h-4 w-4" />
              Add
            </Link>
          </Button>
        </div>
      </div>

      <div className="sm:hidden">
        <TransactionsFilter />
      </div>

      <Card>
        <CardContent className="p-0">
          <TransactionList transactions={transactions} />
        </CardContent>
      </Card>

      <QuickAdd accounts={accounts} categories={categories} />
    </div>
  );
}
