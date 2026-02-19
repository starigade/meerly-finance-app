"use client";

import { useCallback } from "react";
import { formatMoney } from "@/lib/currency";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { InView } from "@/components/motion/in-view";

interface MetricsBarProps {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
  baseCurrency: string;
}

export function MetricsBar({ netWorth, monthlyIncome, monthlyExpense, baseCurrency }: MetricsBarProps) {
  const fmt = useCallback(
    (cents: number) => formatMoney(cents, baseCurrency),
    [baseCurrency]
  );

  return (
    <div className="flex flex-wrap gap-3">
      <InView className="flex-1 min-w-[140px]" index={0}>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="px-4 py-3">
            <p className="text-xs text-muted-foreground">Net Worth</p>
            <AnimatedNumber
              value={netWorth}
              format={fmt}
              className="text-lg font-bold font-mono tabular-nums block"
            />
          </CardContent>
        </Card>
      </InView>
      <InView className="flex-1 min-w-[140px]" index={1}>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="px-4 py-3">
            <p className="text-xs text-muted-foreground">Income</p>
            <AnimatedNumber
              value={monthlyIncome}
              format={fmt}
              className="text-lg font-bold font-mono tabular-nums text-success block"
            />
          </CardContent>
        </Card>
      </InView>
      <InView className="flex-1 min-w-[140px]" index={2}>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="px-4 py-3">
            <p className="text-xs text-muted-foreground">Spending</p>
            <AnimatedNumber
              value={monthlyExpense}
              format={fmt}
              className="text-lg font-bold font-mono tabular-nums text-destructive block"
            />
          </CardContent>
        </Card>
      </InView>
    </div>
  );
}
