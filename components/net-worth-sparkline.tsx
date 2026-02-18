"use client";

import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney } from "@/lib/currency";
import { formatMonthYear } from "@/lib/dates";
import type { NetWorthSnapshot } from "@/lib/types";

interface NetWorthSparklineProps {
  snapshots: NetWorthSnapshot[];
  baseCurrency: string;
  compact?: boolean;
}

export function NetWorthSparkline({ snapshots, baseCurrency, compact = false }: NetWorthSparklineProps) {
  if (snapshots.length < 2) {
    return (
      <div className={`${compact ? "h-24" : "h-[280px]"} flex items-center justify-center text-sm text-neutral`}>
        Net worth trend will appear after your second month
      </div>
    );
  }

  const data = snapshots.map((s) => ({
    month: formatMonthYear(s.month),
    value: s.net_worth_cents,
  }));

  return (
    <div className={compact ? "h-24" : "h-[280px]"}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: compact ? 4 : 8 }}>
          <defs>
            <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ee7b18" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ee7b18" stopOpacity={0} />
            </linearGradient>
          </defs>
          {!compact && (
            <>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#78716c" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatMoney(v, baseCurrency, { compact: true })}
                tick={{ fontSize: 11, fill: "#78716c" }}
                tickLine={false}
                axisLine={false}
                width={60}
              />
            </>
          )}
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
                <div className="bg-base-100 rounded-lg shadow-elevated px-3 py-2 text-xs border border-base-300">
                  <p className="text-neutral">{month}</p>
                  <p className="font-semibold font-mono">{formatMoney(value, baseCurrency)}</p>
                </div>
              );
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
