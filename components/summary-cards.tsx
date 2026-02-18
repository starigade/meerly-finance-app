"use client";

import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/currency";

interface SummaryCardsProps {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
  baseCurrency: string;
}

export function SummaryCards({ netWorth, monthlyIncome, monthlyExpense, baseCurrency }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Net Worth */}
      <Card className="bg-gradient-to-br from-brand-50 to-white border-brand-100">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-brand-600" />
            </div>
            <span className="text-sm font-medium text-muted">Net Worth</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatMoney(netWorth, baseCurrency)}
          </p>
        </CardContent>
      </Card>

      {/* Monthly Income */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-success-light flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <span className="text-sm font-medium text-muted">Income this month</span>
          </div>
          <p className="text-2xl font-bold text-success">
            {formatMoney(monthlyIncome, baseCurrency)}
          </p>
        </CardContent>
      </Card>

      {/* Monthly Expenses */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-danger-light flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-danger" />
            </div>
            <span className="text-sm font-medium text-muted">Spending this month</span>
          </div>
          <p className="text-2xl font-bold text-danger">
            {formatMoney(monthlyExpense, baseCurrency)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
