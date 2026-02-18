"use client";

import { formatMoney } from "@/lib/currency";

interface MetricsBarProps {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
  baseCurrency: string;
}

export function MetricsBar({ netWorth, monthlyIncome, monthlyExpense, baseCurrency }: MetricsBarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="card bg-base-100 border border-base-300 flex-1 min-w-[140px]">
        <div className="card-body px-4 py-3">
          <p className="text-xs text-neutral">Net Worth</p>
          <p className="text-lg font-bold font-mono tabular-nums">
            {formatMoney(netWorth, baseCurrency)}
          </p>
        </div>
      </div>
      <div className="card bg-base-100 border border-base-300 flex-1 min-w-[140px]">
        <div className="card-body px-4 py-3">
          <p className="text-xs text-neutral">Income</p>
          <p className="text-lg font-bold font-mono tabular-nums text-success">
            {formatMoney(monthlyIncome, baseCurrency)}
          </p>
        </div>
      </div>
      <div className="card bg-base-100 border border-base-300 flex-1 min-w-[140px]">
        <div className="card-body px-4 py-3">
          <p className="text-xs text-neutral">Spending</p>
          <p className="text-lg font-bold font-mono tabular-nums text-error">
            {formatMoney(monthlyExpense, baseCurrency)}
          </p>
        </div>
      </div>
    </div>
  );
}
