export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MetricsBar } from "@/components/metrics-bar";
import { NetWorthSparkline } from "@/components/net-worth-sparkline";
import { AccountsPanel } from "@/components/accounts-panel";
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

  const hasSnapshots = dashboard.snapshots.length >= 2;

  return (
    <div className="flex flex-col gap-4">
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
        <div className="lg:col-span-3 card bg-base-100 border border-base-300">
          <div className="card-body p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold">Net Worth Trend</h2>
              <Link href="/reports" className="btn btn-ghost btn-xs text-xs gap-1">
                View Report <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <NetWorthSparkline
              snapshots={dashboard.snapshots}
              baseCurrency={dashboard.household.base_currency}
              compact={!hasSnapshots}
            />
          </div>
        </div>

        {/* Accounts — takes 2 of 5 columns */}
        <div className="lg:col-span-2 card bg-base-100 border border-base-300">
          <div className="card-body p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold">Accounts</h2>
              <Link href="/accounts" className="btn btn-ghost btn-xs text-xs gap-1">
                All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <AccountsPanel balances={dashboard.balances} />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold">Recent Transactions</h2>
            <Link href="/transactions" className="btn btn-ghost btn-xs text-xs gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <TransactionList
            transactions={dashboard.recentTransactions}
            showDelete={false}
            compact
          />
        </div>
      </div>

      <QuickAdd accounts={accounts} categories={categories} />
    </div>
  );
}
