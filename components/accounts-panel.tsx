"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/currency";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import type { AccountBalance } from "@/lib/types";

interface AccountsPanelProps {
  balances: AccountBalance[];
}

export function AccountsPanel({ balances }: AccountsPanelProps) {
  if (balances.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        <p>No accounts yet</p>
        <Link href="/accounts/new" className="text-primary hover:underline text-xs mt-1 inline-block">
          Add your first account
        </Link>
      </div>
    );
  }

  return (
    <Table>
      <TableBody>
        {balances.map((account) => (
          <TableRow key={account.account_id}>
            <TableCell className="font-medium text-sm">
              <Link href={`/accounts/${account.account_id}`} className="hover:text-primary">
                {account.name}
              </Link>
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums text-sm">
              <span className={account.balance < 0 ? "text-destructive" : ""}>
                {formatMoney(account.balance, account.currency)}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
