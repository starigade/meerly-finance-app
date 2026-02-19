"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/currency";
import type { AccountBalance } from "@/lib/types";

export function AccountCard({ account }: { account: AccountBalance }) {
  const isNegative = account.balance < 0;

  return (
    <Link href={`/accounts/${account.account_id}`}>
      <Card className="hover:border-primary/30 transition-colors cursor-pointer">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{account.name}</p>
            <p className="text-xs text-muted-foreground">{account.currency}</p>
          </div>
          <p className={`font-mono tabular-nums font-medium text-sm ${isNegative ? "text-destructive" : ""}`}>
            {formatMoney(account.balance, account.currency)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
