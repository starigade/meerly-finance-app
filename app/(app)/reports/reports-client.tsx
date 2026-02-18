"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatMoney } from "@/lib/currency";
import { UI_LABELS, ACCOUNT_SUB_TYPES } from "@/lib/constants";
import type { AccountBalance, AccountSubType } from "@/lib/types";

interface MonthData {
  start: string;
  end: string;
  label: string;
  income: number;
  expense: number;
  net: number;
}

interface ReportsClientProps {
  monthlyData: MonthData[];
  monthCount: number;
  netWorthReport: { balances: AccountBalance[]; baseCurrency: string };
}

export function ReportsClient({ monthlyData, monthCount, netWorthReport }: ReportsClientProps) {
  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
  const totalExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0);

  const { balances, baseCurrency } = netWorthReport;
  const assets = balances.filter((b) => b.account_type === "asset");
  const liabilities = balances.filter((b) => b.account_type === "liability");
  const totalAssets = assets.reduce((sum, a) => sum + (a.balance ?? 0), 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + (a.balance ?? 0), 0);
  const netWorth = totalAssets + totalLiabilities;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Reports</h1>

      <Tabs defaultValue="income-spending">
        <TabsList className="w-full">
          <TabsTrigger value="income-spending" className="flex-1">Income & Spending</TabsTrigger>
          <TabsTrigger value="net-worth" className="flex-1">Net Worth</TabsTrigger>
        </TabsList>

        {/* Income & Spending Tab */}
        <TabsContent value="income-spending" className="space-y-4">
          <div className="stats stats-horizontal w-full border border-base-300">
            <div className="stat px-4 py-3">
              <div className="stat-title text-xs">Total Income</div>
              <div className="stat-value text-base font-mono tabular-nums text-success">
                {formatMoney(totalIncome)}
              </div>
            </div>
            <div className="stat px-4 py-3">
              <div className="stat-title text-xs">Total Spending</div>
              <div className="stat-value text-base font-mono tabular-nums text-error">
                {formatMoney(totalExpense)}
              </div>
            </div>
            <div className="stat px-4 py-3">
              <div className="stat-title text-xs">Net</div>
              <div className={`stat-value text-base font-mono tabular-nums ${totalIncome - totalExpense >= 0 ? "text-success" : "text-error"}`}>
                {formatMoney(totalIncome - totalExpense)}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4">
              <h2 className="text-sm font-semibold mb-2">Last {monthCount} Months</h2>
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th className="text-xs font-medium text-neutral">Month</th>
                      <th className="text-xs font-medium text-neutral text-right">Income</th>
                      <th className="text-xs font-medium text-neutral text-right">Spending</th>
                      <th className="text-xs font-medium text-neutral text-right">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((m) => (
                      <tr key={m.start} className="hover">
                        <td className="font-medium text-sm">{m.label}</td>
                        <td className="text-right font-mono tabular-nums text-sm text-success">
                          {formatMoney(m.income)}
                        </td>
                        <td className="text-right font-mono tabular-nums text-sm text-error">
                          {formatMoney(m.expense)}
                        </td>
                        <td className={`text-right font-mono tabular-nums text-sm font-medium ${m.net >= 0 ? "text-success" : "text-error"}`}>
                          {formatMoney(m.net)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold">
                      <td>Total</td>
                      <td className="text-right font-mono tabular-nums text-success">{formatMoney(totalIncome)}</td>
                      <td className="text-right font-mono tabular-nums text-error">{formatMoney(totalExpense)}</td>
                      <td className={`text-right font-mono tabular-nums ${totalIncome - totalExpense >= 0 ? "text-success" : "text-error"}`}>
                        {formatMoney(totalIncome - totalExpense)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {monthlyData.every((m) => m.income === 0 && m.expense === 0) && (
            <p className="text-center text-neutral py-6 text-sm">
              No transaction data yet. Add some transactions to see your income and spending report.
            </p>
          )}
        </TabsContent>

        {/* Net Worth Tab */}
        <TabsContent value="net-worth" className="space-y-4">
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-6 text-center">
              <p className="text-xs text-neutral uppercase tracking-wider mb-1">Total Net Worth</p>
              <p className="text-3xl font-bold font-mono tabular-nums">
                {formatMoney(netWorth, baseCurrency)}
              </p>
              <div className="flex justify-center gap-6 mt-3 text-sm">
                <span>
                  <span className="text-neutral">Assets: </span>
                  <span className="font-medium font-mono text-success">{formatMoney(totalAssets, baseCurrency)}</span>
                </span>
                <span>
                  <span className="text-neutral">Liabilities: </span>
                  <span className="font-medium font-mono text-error">{formatMoney(Math.abs(totalLiabilities), baseCurrency)}</span>
                </span>
              </div>
            </div>
          </div>

          {assets.length > 0 && (
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body p-4">
                <h2 className="text-sm font-semibold mb-2">{UI_LABELS.asset}</h2>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th className="text-xs font-medium text-neutral">Account</th>
                      <th className="text-xs font-medium text-neutral text-right">Currency</th>
                      <th className="text-xs font-medium text-neutral text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((a) => (
                      <tr key={a.account_id} className="hover">
                        <td>
                          <p className="font-medium text-sm">{a.name}</p>
                          <p className="text-xs text-neutral">
                            {ACCOUNT_SUB_TYPES[a.sub_type as AccountSubType]?.label}
                          </p>
                        </td>
                        <td className="text-right text-neutral text-sm">{a.currency}</td>
                        <td className="text-right font-mono tabular-nums text-sm font-medium text-success">
                          {formatMoney(a.balance, a.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold">
                      <td colSpan={2}>Total Assets</td>
                      <td className="text-right font-mono tabular-nums text-success">
                        {formatMoney(totalAssets, baseCurrency)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {liabilities.length > 0 && (
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body p-4">
                <h2 className="text-sm font-semibold mb-2">{UI_LABELS.liability}</h2>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th className="text-xs font-medium text-neutral">Account</th>
                      <th className="text-xs font-medium text-neutral text-right">Currency</th>
                      <th className="text-xs font-medium text-neutral text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liabilities.map((a) => (
                      <tr key={a.account_id} className="hover">
                        <td>
                          <p className="font-medium text-sm">{a.name}</p>
                          <p className="text-xs text-neutral">
                            {ACCOUNT_SUB_TYPES[a.sub_type as AccountSubType]?.label}
                          </p>
                        </td>
                        <td className="text-right text-neutral text-sm">{a.currency}</td>
                        <td className="text-right font-mono tabular-nums text-sm font-medium text-error">
                          {formatMoney(a.balance, a.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold">
                      <td colSpan={2}>Total Liabilities</td>
                      <td className="text-right font-mono tabular-nums text-error">
                        {formatMoney(Math.abs(totalLiabilities), baseCurrency)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {balances.length === 0 && (
            <p className="text-center text-neutral py-6 text-sm">
              Add accounts to see your net worth breakdown.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
