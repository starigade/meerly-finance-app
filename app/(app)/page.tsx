export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MetricsBar } from "@/components/metrics-bar";
import { NetWorthSparkline } from "@/components/net-worth-sparkline";
import { AccountsPanel } from "@/components/accounts-panel";
import { TransactionList } from "@/components/transaction-list";
import { QuickAdd } from "@/components/quick-add";
import { DashboardShell } from "@/components/dashboard-shell";
import { getDashboardData, getAccounts, getCategories, checkOnboardingComplete } from "@/lib/actions";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const onboarded = await checkOnboardingComplete();
  if (!onboarded) redirect("/onboarding");

  const [dashboard, accounts, categories] = await Promise.all([
    getDashboardData(),
    getAccounts(),
    getCategories(),
  ]);

  const hasSnapshots = dashboard.snapshots.length >= 2;

  return (
    <DashboardShell>
      {/* Metrics strip */}
      <MetricsBar
        netWorth={dashboard.netWorth}
        monthlyIncome={dashboard.monthlyIncome}
        monthlyExpense={dashboard.monthlyExpense}
        baseCurrency={dashboard.household.base_currency}
      />

      {/* Main content: chart + accounts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Chart — takes 3 of 5 columns */}
        <Card className="lg:col-span-3 transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold">Net Worth Trend</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/reports" className="text-xs gap-1">
                  View Report <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
            <NetWorthSparkline
              snapshots={dashboard.snapshots}
              baseCurrency={dashboard.household.base_currency}
              compact={!hasSnapshots}
            />
          </CardContent>
        </Card>

        {/* Accounts — takes 2 of 5 columns */}
        <Card className="lg:col-span-2 transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold">Accounts</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/accounts" className="text-xs gap-1">
                  All <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
            <AccountsPanel balances={dashboard.balances} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="transition-all hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold">Recent Transactions</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/transactions" className="text-xs gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <TransactionList
            transactions={dashboard.recentTransactions}
            showDelete={false}
            compact
          />
        </CardContent>
      </Card>

      <QuickAdd accounts={accounts} categories={categories} />
    </DashboardShell>
  );
}
