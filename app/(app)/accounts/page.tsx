export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountCard } from "@/components/account-card";
import { getAccountBalances } from "@/lib/actions";
import { formatMoney } from "@/lib/currency";
import { UI_LABELS } from "@/lib/constants";

export default async function AccountsPage() {
  const balances = await getAccountBalances();
  const assets = balances.filter((b) => b.account_type === "asset");
  const liabilities = balances.filter((b) => b.account_type === "liability");

  const totalAssets = assets.reduce((sum, a) => sum + (a.balance ?? 0), 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + (a.balance ?? 0), 0);
  const netWorth = totalAssets + totalLiabilities;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="text-sm text-muted">Manage your financial accounts</p>
        </div>
        <Button asChild>
          <Link href="/accounts/new">
            <Plus className="h-4 w-4 mr-1" />
            Add Account
          </Link>
        </Button>
      </div>

      {/* Net Worth Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-card text-center">
          <p className="text-xs text-muted mb-1">{UI_LABELS.asset}</p>
          <p className="text-lg font-bold text-success">{formatMoney(totalAssets)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-card text-center">
          <p className="text-xs text-muted mb-1">{UI_LABELS.liability}</p>
          <p className="text-lg font-bold text-danger">{formatMoney(totalLiabilities)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-card text-center">
          <p className="text-xs text-muted mb-1">{UI_LABELS.net_worth}</p>
          <p className="text-lg font-bold text-gray-900">{formatMoney(netWorth)}</p>
        </div>
      </div>

      {/* Assets */}
      {assets.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
            {UI_LABELS.asset}
          </h2>
          <div className="space-y-2">
            {assets.map((account) => (
              <AccountCard key={account.account_id} account={account} />
            ))}
          </div>
        </div>
      )}

      {/* Liabilities */}
      {liabilities.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
            {UI_LABELS.liability}
          </h2>
          <div className="space-y-2">
            {liabilities.map((account) => (
              <AccountCard key={account.account_id} account={account} />
            ))}
          </div>
        </div>
      )}

      {balances.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted mb-4">No accounts yet. Add your first account to get started.</p>
          <Button asChild>
            <Link href="/accounts/new">
              <Plus className="h-4 w-4 mr-1" />
              Add Account
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
