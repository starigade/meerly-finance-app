"use client";

import Link from "next/link";
import {
  Landmark,
  PiggyBank,
  TrendingUp,
  Home,
  Banknote,
  Wallet,
  CreditCard,
  Building,
  GraduationCap,
  HandCoins,
  CircleMinus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { AccountBalance } from "@/lib/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  landmark: Landmark,
  "piggy-bank": PiggyBank,
  "trending-up": TrendingUp,
  home: Home,
  banknote: Banknote,
  wallet: Wallet,
  "credit-card": CreditCard,
  building: Building,
  "graduation-cap": GraduationCap,
  "hand-coins": HandCoins,
  "circle-minus": CircleMinus,
};

export function AccountCard({ account }: { account: AccountBalance }) {
  const Icon = iconMap[account.sub_type] ?? Wallet;
  const isNegative = account.balance < 0;
  const isLiability = account.account_type === "liability";

  return (
    <Link href={`/accounts/${account.account_id}`}>
      <Card className="hover:shadow-elevated transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                isLiability ? "bg-danger-light" : "bg-success-light"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isLiability ? "text-danger" : "text-success"
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{account.name}</p>
              <p className="text-xs text-muted">{account.currency}</p>
            </div>
            <p
              className={cn(
                "font-semibold text-right",
                isNegative ? "text-danger" : "text-gray-900"
              )}
            >
              {formatMoney(account.balance, account.currency)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
