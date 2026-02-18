export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMonthlyPnl } from "@/lib/actions";
import { formatMoney } from "@/lib/currency";
import { formatMonthYear, getLastNMonths } from "@/lib/dates";

export default async function IncomeSpendingPage({
  searchParams,
}: {
  searchParams: Promise<{ months?: string }>;
}) {
  const params = await searchParams;
  const monthCount = parseInt(params.months ?? "6") || 6;
  const months = getLastNMonths(monthCount);
  const startDate = months[0].start;
  const endDate = months[months.length - 1].end;

  const data = await getMonthlyPnl(startDate, endDate);

  // Group by month
  const monthlyData = months.map((m) => {
    const monthEntries = data.filter((d) => d.month === m.start);
    const income = monthEntries
      .filter((d) => d.category_type === "income")
      .reduce((sum, d) => sum + Math.abs(d.total_base_cents), 0);
    const expense = monthEntries
      .filter((d) => d.category_type === "expense")
      .reduce((sum, d) => sum + d.total_base_cents, 0);

    // Category breakdown for this month
    const categories = monthEntries.map((d) => ({
      name: d.category_name,
      type: d.category_type,
      amount: d.total_base_cents,
      color: d.color,
    }));

    return { ...m, income, expense, net: income - expense, categories };
  });

  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
  const totalExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Income & Spending</h1>
        <p className="text-sm text-muted">Last {monthCount} months overview</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-card text-center">
          <p className="text-xs text-muted mb-1">Total Income</p>
          <p className="text-lg font-bold text-success">{formatMoney(totalIncome)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-card text-center">
          <p className="text-xs text-muted mb-1">Total Spending</p>
          <p className="text-lg font-bold text-danger">{formatMoney(totalExpense)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-card text-center">
          <p className="text-xs text-muted mb-1">Net</p>
          <p className={`text-lg font-bold ${totalIncome - totalExpense >= 0 ? "text-success" : "text-danger"}`}>
            {formatMoney(totalIncome - totalExpense)}
          </p>
        </div>
      </div>

      {/* Monthly breakdown table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-tertiary">
                  <th className="text-left px-5 py-3 font-medium text-muted">Month</th>
                  <th className="text-right px-5 py-3 font-medium text-muted">Income</th>
                  <th className="text-right px-5 py-3 font-medium text-muted">Spending</th>
                  <th className="text-right px-5 py-3 font-medium text-muted">Net</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((m) => (
                  <tr key={m.start} className="border-b border-surface-tertiary last:border-0 hover:bg-surface-secondary transition-colors">
                    <td className="px-5 py-3 font-medium">{m.label}</td>
                    <td className="px-5 py-3 text-right text-success">
                      {formatMoney(m.income)}
                    </td>
                    <td className="px-5 py-3 text-right text-danger">
                      {formatMoney(m.expense)}
                    </td>
                    <td className={`px-5 py-3 text-right font-medium ${m.net >= 0 ? "text-success" : "text-danger"}`}>
                      {formatMoney(m.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface-secondary font-semibold">
                  <td className="px-5 py-3">Total</td>
                  <td className="px-5 py-3 text-right text-success">{formatMoney(totalIncome)}</td>
                  <td className="px-5 py-3 text-right text-danger">{formatMoney(totalExpense)}</td>
                  <td className={`px-5 py-3 text-right ${totalIncome - totalExpense >= 0 ? "text-success" : "text-danger"}`}>
                    {formatMoney(totalIncome - totalExpense)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {data.length === 0 && (
        <p className="text-center text-muted py-8">
          No transaction data yet. Add some transactions to see your income and spending report.
        </p>
      )}
    </div>
  );
}
