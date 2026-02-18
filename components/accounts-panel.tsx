"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/currency";
import type { AccountBalance } from "@/lib/types";

interface AccountsPanelProps {
  balances: AccountBalance[];
}

export function AccountsPanel({ balances }: AccountsPanelProps) {
  if (balances.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-neutral">
        <p>No accounts yet</p>
        <Link href="/accounts/new" className="link link-primary text-xs mt-1 inline-block">
          Add your first account
        </Link>
      </div>
    );
  }

  return (
    <table className="table table-sm">
      <tbody>
        {balances.map((account) => (
          <tr key={account.account_id} className="hover">
            <td className="font-medium text-sm">
              <Link href={`/accounts/${account.account_id}`} className="hover:text-primary">
                {account.name}
              </Link>
            </td>
            <td className="text-right font-mono tabular-nums text-sm">
              <span className={account.balance < 0 ? "text-error" : ""}>
                {formatMoney(account.balance, account.currency)}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
