export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-muted">{transactions.length} transactions</p>
        </div>
        <Button asChild>
          <Link href="/transactions/new">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Link>
        </Button>
      </div>

      <TransactionsFilter />

      <Card>
        <CardContent className="p-4">
          <TransactionList transactions={transactions} />
        </CardContent>
      </Card>

      <QuickAdd accounts={accounts} categories={categories} />
    </div>
  );
}
