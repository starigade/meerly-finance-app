"use client";

import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis } from "recharts";
import { formatMoney } from "@/lib/currency";
import { formatMonthYear } from "@/lib/dates";
import type { NetWorthSnapshot } from "@/lib/types";

interface NetWorthSparklineProps {
  snapshots: NetWorthSnapshot[];
  baseCurrency: string;
}

export function NetWorthSparkline({ snapshots, baseCurrency }: NetWorthSparklineProps) {
  if (snapshots.length < 2) {
    return (
      <div className="h-24 flex items-center justify-center text-sm text-muted">
        Net worth trend will appear after your second month
      </div>
    );
  }

  const data = snapshots.map((s) => ({
    month: formatMonthYear(s.month),
    value: s.net_worth_cents,
  }));

  return (
    <div className="h-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ee7b18" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ee7b18" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke="#ee7b18"
            strokeWidth={2}
            fill="url(#netWorthGradient)"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const { month, value } = payload[0].payload;
              return (
                <div className="bg-white rounded-lg shadow-elevated px-3 py-2 text-xs border border-surface-tertiary">
                  <p className="text-muted">{month}</p>
                  <p className="font-semibold">{formatMoney(value, baseCurrency)}</p>
                </div>
              );
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
