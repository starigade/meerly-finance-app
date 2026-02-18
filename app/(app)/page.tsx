export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SummaryCards } from "@/components/summary-cards";
import { NetWorthSparkline } from "@/components/net-worth-sparkline";
import { TransactionList } from "@/components/transaction-list";
import { QuickAdd } from "@/components/quick-add";
import { getDashboardData, getAccounts, getCategories, checkOnboardingComplete } from "@/lib/actions";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const onboarded = await checkOnboardingComplete();
  if (!onboarded) redirect("/onboarding");

  const [dashboard, accounts, categories] = await Promise.all([
    getDashboardData(),
    getAccounts(),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-muted">Your financial overview</p>
      </div>

      <SummaryCards
        netWorth={dashboard.netWorth}
        monthlyIncome={dashboard.monthlyIncome}
        monthlyExpense={dashboard.monthlyExpense}
        baseCurrency={dashboard.household.base_currency}
      />

      {/* Net Worth Trend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Net Worth Trend</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/reports/net-worth" className="text-xs">
              View Report <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="pb-4">
          <NetWorthSparkline
            snapshots={dashboard.snapshots}
            baseCurrency={dashboard.household.base_currency}
          />
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Transactions</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/transactions" className="text-xs">
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <TransactionList
            transactions={dashboard.recentTransactions}
            showDelete={false}
          />
        </CardContent>
      </Card>

      <QuickAdd accounts={accounts} categories={categories} />
    </div>
  );
}
