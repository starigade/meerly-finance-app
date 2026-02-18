"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/currency";
import type { AccountBalance } from "@/lib/types";

export function AccountCard({ account }: { account: AccountBalance }) {
  const isNegative = account.balance < 0;

  return (
    <Link href={`/accounts/${account.account_id}`}>
      <div className="card bg-base-100 border border-base-300 hover:border-primary/30 transition-colors cursor-pointer">
        <div className="card-body p-4 flex-row items-center justify-between">
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{account.name}</p>
            <p className="text-xs text-neutral">{account.currency}</p>
          </div>
          <p className={`font-mono tabular-nums font-medium text-sm ${isNegative ? "text-error" : ""}`}>
            {formatMoney(account.balance, account.currency)}
          </p>
        </div>
      </div>
    </Link>
  );
}
