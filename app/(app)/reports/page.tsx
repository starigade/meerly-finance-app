export const dynamic = "force-dynamic";

import { getMonthlyPnl, getNetWorthReport } from "@/lib/actions";
import { getLastNMonths } from "@/lib/dates";
import { ReportsClient } from "./reports-client";

export default async function ReportsPage() {
  const monthCount = 6;
  const months = getLastNMonths(monthCount);
  const startDate = months[0].start;
  const endDate = months[months.length - 1].end;

  const [pnlData, netWorthReport] = await Promise.all([
    getMonthlyPnl(startDate, endDate),
    getNetWorthReport(),
  ]);

  // Process monthly P&L data
  const monthlyData = months.map((m) => {
    const monthEntries = pnlData.filter((d) => d.month === m.start);
    const income = monthEntries
      .filter((d) => d.category_type === "income")
      .reduce((sum, d) => sum + Math.abs(d.total_base_cents), 0);
    const expense = monthEntries
      .filter((d) => d.category_type === "expense")
      .reduce((sum, d) => sum + d.total_base_cents, 0);
    return { ...m, income, expense, net: income - expense };
  });

  return (
    <ReportsClient
      monthlyData={monthlyData}
      monthCount={monthCount}
      netWorthReport={netWorthReport}
    />
  );
}
