export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { getAccountBalances } from "@/lib/actions";
import { formatMoney } from "@/lib/currency";
import { UI_LABELS, ACCOUNT_SUB_TYPES } from "@/lib/constants";
import type { AccountSubType } from "@/lib/types";

export default async function AccountsPage() {
  const balances = await getAccountBalances();
  const assets = balances.filter((b) => b.account_type === "asset");
  const liabilities = balances.filter((b) => b.account_type === "liability");

  const totalAssets = assets.reduce((sum, a) => sum + (a.balance ?? 0), 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + (a.balance ?? 0), 0);
  const netWorth = totalAssets + totalLiabilities;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Accounts</h1>
        <Button size="sm" asChild>
          <Link href="/accounts/new">
            <Plus className="h-4 w-4" />
            Add Account
          </Link>
        </Button>
      </div>

      {/* Summary stats */}
      <div className="flex flex-wrap gap-3">
        <Card className="flex-1 min-w-[140px]">
          <CardContent className="px-4 py-3">
            <p className="text-xs text-muted-foreground">{UI_LABELS.asset}</p>
            <p className="text-base font-bold font-mono tabular-nums text-success">
              {formatMoney(totalAssets)}
            </p>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[140px]">
          <CardContent className="px-4 py-3">
            <p className="text-xs text-muted-foreground">{UI_LABELS.liability}</p>
            <p className="text-base font-bold font-mono tabular-nums text-destructive">
              {formatMoney(totalLiabilities)}
            </p>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[140px]">
          <CardContent className="px-4 py-3">
            <p className="text-xs text-muted-foreground">{UI_LABELS.net_worth}</p>
            <p className="text-base font-bold font-mono tabular-nums">
              {formatMoney(netWorth)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two-column layout: Assets | Liabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Assets */}
        {assets.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {UI_LABELS.asset}
              </h2>
              <Table>
                <TableBody>
                  {assets.map((account) => (
                    <TableRow key={account.account_id}>
                      <TableCell>
                        <Link href={`/accounts/${account.account_id}`} className="hover:text-primary">
                          <p className="font-medium text-sm">{account.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {ACCOUNT_SUB_TYPES[account.sub_type as AccountSubType]?.label} &middot; {account.currency}
                          </p>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-sm font-medium">
                        {formatMoney(account.balance, account.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Liabilities */}
        {liabilities.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {UI_LABELS.liability}
              </h2>
              <Table>
                <TableBody>
                  {liabilities.map((account) => (
                    <TableRow key={account.account_id}>
                      <TableCell>
                        <Link href={`/accounts/${account.account_id}`} className="hover:text-primary">
                          <p className="font-medium text-sm">{account.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {ACCOUNT_SUB_TYPES[account.sub_type as AccountSubType]?.label} &middot; {account.currency}
                          </p>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-sm font-medium text-destructive">
                        {formatMoney(account.balance, account.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {balances.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No accounts yet. Add your first account to get started.</p>
          <Button asChild>
            <Link href="/accounts/new">
              <Plus className="h-4 w-4" />
              Add Account
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
