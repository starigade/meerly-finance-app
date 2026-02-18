export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { getAccountBalances } from "@/lib/actions";
import { formatMoney } from "@/lib/currency";
import { UI_LABELS, ACCOUNT_SUB_TYPES } from "@/lib/constants";
import type { AccountSubType } from "@/lib/types";

export default async function AccountsPage() {
  const balances = await getAccountBalances();
  const assets = balances.filter((b) => b.account_type === "asset");
  const liabilities = balances.filter((b) => b.account_type === "liability");

  const totalAssets = assets.reduce((sum, a) => sum + (a.balance ?? 0), 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + (a.balance ?? 0), 0);
  const netWorth = totalAssets + totalLiabilities;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Accounts</h1>
        <Link href="/accounts/new" className="btn btn-primary btn-sm">
          <Plus className="h-4 w-4" />
          Add Account
        </Link>
      </div>

      {/* Summary stats */}
      <div className="flex flex-wrap gap-3">
        <div className="card bg-base-100 border border-base-300 flex-1 min-w-[140px]">
          <div className="card-body px-4 py-3">
            <p className="text-xs text-neutral">{UI_LABELS.asset}</p>
            <p className="text-base font-bold font-mono tabular-nums text-success">
              {formatMoney(totalAssets)}
            </p>
          </div>
        </div>
        <div className="card bg-base-100 border border-base-300 flex-1 min-w-[140px]">
          <div className="card-body px-4 py-3">
            <p className="text-xs text-neutral">{UI_LABELS.liability}</p>
            <p className="text-base font-bold font-mono tabular-nums text-error">
              {formatMoney(totalLiabilities)}
            </p>
          </div>
        </div>
        <div className="card bg-base-100 border border-base-300 flex-1 min-w-[140px]">
          <div className="card-body px-4 py-3">
            <p className="text-xs text-neutral">{UI_LABELS.net_worth}</p>
            <p className="text-base font-bold font-mono tabular-nums">
              {formatMoney(netWorth)}
            </p>
          </div>
        </div>
      </div>

      {/* Two-column layout: Assets | Liabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Assets */}
        {assets.length > 0 && (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4">
              <h2 className="text-xs font-semibold text-neutral uppercase tracking-wider mb-2">
                {UI_LABELS.asset}
              </h2>
              <table className="table table-sm">
                <tbody>
                  {assets.map((account) => (
                    <tr key={account.account_id} className="hover">
                      <td>
                        <Link href={`/accounts/${account.account_id}`} className="hover:text-primary">
                          <p className="font-medium text-sm">{account.name}</p>
                          <p className="text-xs text-neutral">
                            {ACCOUNT_SUB_TYPES[account.sub_type as AccountSubType]?.label} &middot; {account.currency}
                          </p>
                        </Link>
                      </td>
                      <td className="text-right font-mono tabular-nums text-sm font-medium">
                        {formatMoney(account.balance, account.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Liabilities */}
        {liabilities.length > 0 && (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4">
              <h2 className="text-xs font-semibold text-neutral uppercase tracking-wider mb-2">
                {UI_LABELS.liability}
              </h2>
              <table className="table table-sm">
                <tbody>
                  {liabilities.map((account) => (
                    <tr key={account.account_id} className="hover">
                      <td>
                        <Link href={`/accounts/${account.account_id}`} className="hover:text-primary">
                          <p className="font-medium text-sm">{account.name}</p>
                          <p className="text-xs text-neutral">
                            {ACCOUNT_SUB_TYPES[account.sub_type as AccountSubType]?.label} &middot; {account.currency}
                          </p>
                        </Link>
                      </td>
                      <td className="text-right font-mono tabular-nums text-sm font-medium text-error">
                        {formatMoney(account.balance, account.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {balances.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral mb-4">No accounts yet. Add your first account to get started.</p>
          <Link href="/accounts/new" className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Add Account
          </Link>
        </div>
      )}
    </div>
  );
}
