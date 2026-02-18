export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNetWorthReport } from "@/lib/actions";
import { formatMoney } from "@/lib/currency";
import { UI_LABELS, ACCOUNT_SUB_TYPES } from "@/lib/constants";
import type { AccountSubType } from "@/lib/types";

export default async function NetWorthPage() {
  const { balances, baseCurrency } = await getNetWorthReport();

  const assets = balances.filter((b) => b.account_type === "asset");
  const liabilities = balances.filter((b) => b.account_type === "liability");
  const totalAssets = assets.reduce((sum, a) => sum + (a.balance ?? 0), 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + (a.balance ?? 0), 0);
  const netWorth = totalAssets + totalLiabilities;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Net Worth</h1>
        <p className="text-sm text-muted">A snapshot of what you own and owe</p>
      </div>

      {/* Net Worth Summary */}
      <Card className="bg-gradient-to-br from-brand-50 to-white border-brand-100">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted mb-1">Total Net Worth</p>
          <p className="text-4xl font-bold text-gray-900">
            {formatMoney(netWorth, baseCurrency)}
          </p>
          <div className="flex justify-center gap-8 mt-4 text-sm">
            <div>
              <span className="text-muted">Assets:</span>{" "}
              <span className="font-medium text-success">{formatMoney(totalAssets, baseCurrency)}</span>
            </div>
            <div>
              <span className="text-muted">Liabilities:</span>{" "}
              <span className="font-medium text-danger">{formatMoney(Math.abs(totalLiabilities), baseCurrency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets table */}
      {assets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{UI_LABELS.asset}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-tertiary">
                  <th className="text-left px-5 py-3 font-medium text-muted">Account</th>
                  <th className="text-right px-5 py-3 font-medium text-muted">Currency</th>
                  <th className="text-right px-5 py-3 font-medium text-muted">Balance</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((a) => (
                  <tr key={a.account_id} className="border-b border-surface-tertiary last:border-0 hover:bg-surface-secondary transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium">{a.name}</p>
                      <p className="text-xs text-muted">
                        {ACCOUNT_SUB_TYPES[a.sub_type as AccountSubType]?.label}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right text-muted">{a.currency}</td>
                    <td className="px-5 py-3 text-right font-medium text-success">
                      {formatMoney(a.balance, a.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface-secondary font-semibold">
                  <td className="px-5 py-3" colSpan={2}>Total Assets</td>
                  <td className="px-5 py-3 text-right text-success">
                    {formatMoney(totalAssets, baseCurrency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Liabilities table */}
      {liabilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{UI_LABELS.liability}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-tertiary">
                  <th className="text-left px-5 py-3 font-medium text-muted">Account</th>
                  <th className="text-right px-5 py-3 font-medium text-muted">Currency</th>
                  <th className="text-right px-5 py-3 font-medium text-muted">Balance</th>
                </tr>
              </thead>
              <tbody>
                {liabilities.map((a) => (
                  <tr key={a.account_id} className="border-b border-surface-tertiary last:border-0 hover:bg-surface-secondary transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium">{a.name}</p>
                      <p className="text-xs text-muted">
                        {ACCOUNT_SUB_TYPES[a.sub_type as AccountSubType]?.label}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right text-muted">{a.currency}</td>
                    <td className="px-5 py-3 text-right font-medium text-danger">
                      {formatMoney(a.balance, a.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface-secondary font-semibold">
                  <td className="px-5 py-3" colSpan={2}>Total Liabilities</td>
                  <td className="px-5 py-3 text-right text-danger">
                    {formatMoney(Math.abs(totalLiabilities), baseCurrency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      )}

      {balances.length === 0 && (
        <p className="text-center text-muted py-8">
          Add accounts to see your net worth breakdown.
        </p>
      )}
    </div>
  );
}
