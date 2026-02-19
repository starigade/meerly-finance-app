"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell } from "@/components/ui/table";
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
          <div className="flex flex-wrap gap-3">
            <Card className="flex-1 min-w-[120px]">
              <CardContent className="px-4 py-3">
                <p className="text-xs text-muted-foreground">Total Income</p>
                <p className="text-base font-bold font-mono tabular-nums text-success">
                  {formatMoney(totalIncome)}
                </p>
              </CardContent>
            </Card>
            <Card className="flex-1 min-w-[120px]">
              <CardContent className="px-4 py-3">
                <p className="text-xs text-muted-foreground">Total Spending</p>
                <p className="text-base font-bold font-mono tabular-nums text-destructive">
                  {formatMoney(totalExpense)}
                </p>
              </CardContent>
            </Card>
            <Card className="flex-1 min-w-[120px]">
              <CardContent className="px-4 py-3">
                <p className="text-xs text-muted-foreground">Net</p>
                <p className={`text-base font-bold font-mono tabular-nums ${totalIncome - totalExpense >= 0 ? "text-success" : "text-destructive"}`}>
                  {formatMoney(totalIncome - totalExpense)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-sm font-semibold mb-2">Last {monthCount} Months</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium">Month</TableHead>
                    <TableHead className="text-xs font-medium text-right">Income</TableHead>
                    <TableHead className="text-xs font-medium text-right">Spending</TableHead>
                    <TableHead className="text-xs font-medium text-right">Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.map((m) => (
                    <TableRow key={m.start}>
                      <TableCell className="font-medium text-sm">{m.label}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-sm text-success">
                        {formatMoney(m.income)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-sm text-destructive">
                        {formatMoney(m.expense)}
                      </TableCell>
                      <TableCell className={`text-right font-mono tabular-nums text-sm font-medium ${m.net >= 0 ? "text-success" : "text-destructive"}`}>
                        {formatMoney(m.net)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="font-semibold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-success">{formatMoney(totalIncome)}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-destructive">{formatMoney(totalExpense)}</TableCell>
                    <TableCell className={`text-right font-mono tabular-nums ${totalIncome - totalExpense >= 0 ? "text-success" : "text-destructive"}`}>
                      {formatMoney(totalIncome - totalExpense)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          {monthlyData.every((m) => m.income === 0 && m.expense === 0) && (
            <p className="text-center text-muted-foreground py-6 text-sm">
              No transaction data yet. Add some transactions to see your income and spending report.
            </p>
          )}
        </TabsContent>

        {/* Net Worth Tab */}
        <TabsContent value="net-worth" className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Net Worth</p>
              <p className="text-3xl font-bold font-mono tabular-nums">
                {formatMoney(netWorth, baseCurrency)}
              </p>
              <div className="flex justify-center gap-6 mt-3 text-sm">
                <span>
                  <span className="text-muted-foreground">Assets: </span>
                  <span className="font-medium font-mono text-success">{formatMoney(totalAssets, baseCurrency)}</span>
                </span>
                <span>
                  <span className="text-muted-foreground">Liabilities: </span>
                  <span className="font-medium font-mono text-destructive">{formatMoney(Math.abs(totalLiabilities), baseCurrency)}</span>
                </span>
              </div>
            </CardContent>
          </Card>

          {assets.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h2 className="text-sm font-semibold mb-2">{UI_LABELS.asset}</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-medium">Account</TableHead>
                      <TableHead className="text-xs font-medium text-right">Currency</TableHead>
                      <TableHead className="text-xs font-medium text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((a) => (
                      <TableRow key={a.account_id}>
                        <TableCell>
                          <p className="font-medium text-sm">{a.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {ACCOUNT_SUB_TYPES[a.sub_type as AccountSubType]?.label}
                          </p>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">{a.currency}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-sm font-medium text-success">
                          {formatMoney(a.balance, a.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="font-semibold">
                      <TableCell colSpan={2}>Total Assets</TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-success">
                        {formatMoney(totalAssets, baseCurrency)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          )}

          {liabilities.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h2 className="text-sm font-semibold mb-2">{UI_LABELS.liability}</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-medium">Account</TableHead>
                      <TableHead className="text-xs font-medium text-right">Currency</TableHead>
                      <TableHead className="text-xs font-medium text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liabilities.map((a) => (
                      <TableRow key={a.account_id}>
                        <TableCell>
                          <p className="font-medium text-sm">{a.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {ACCOUNT_SUB_TYPES[a.sub_type as AccountSubType]?.label}
                          </p>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">{a.currency}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-sm font-medium text-destructive">
                          {formatMoney(a.balance, a.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="font-semibold">
                      <TableCell colSpan={2}>Total Liabilities</TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-destructive">
                        {formatMoney(Math.abs(totalLiabilities), baseCurrency)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          )}

          {balances.length === 0 && (
            <p className="text-center text-muted-foreground py-6 text-sm">
              Add accounts to see your net worth breakdown.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
