export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney, formatAmount } from "@/lib/currency";
import { formatDate } from "@/lib/dates";
import { ACCOUNT_SUB_TYPES, UI_LABELS } from "@/lib/constants";

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServerSupabaseClient();

  const { data: account } = await supabase
    .from("account_balances")
    .select("*")
    .eq("account_id", id)
    .single();

  if (!account) notFound();

  // Get recent transactions for this account
  const { data: entries } = await supabase
    .from("transaction_entries")
    .select(`
      *,
      transaction:transactions(id, date, description, ui_type, deleted_at),
      category:categories(id, name, icon, color)
    `)
    .eq("account_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  const activeEntries = (entries ?? []).filter(
    (e) => e.transaction && !e.transaction.deleted_at
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/accounts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
          <p className="text-sm text-muted">
            {ACCOUNT_SUB_TYPES[account.sub_type as keyof typeof ACCOUNT_SUB_TYPES]?.label ?? account.sub_type} &middot; {account.currency}
          </p>
        </div>
      </div>

      {/* Balance */}
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted mb-1">Current Balance</p>
          <p className="text-4xl font-bold text-gray-900">
            {formatMoney(account.balance, account.currency)}
          </p>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {activeEntries.length === 0 ? (
            <p className="text-center text-muted py-8 px-5">No transactions yet</p>
          ) : (
            <div className="divide-y divide-surface-tertiary">
              {activeEntries.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/transactions/${entry.transaction.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-surface-secondary transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      {entry.transaction.description ?? entry.category?.name ?? "Transaction"}
                    </p>
                    <p className="text-xs text-muted">
                      {formatDate(entry.transaction.date)}
                    </p>
                  </div>
                  <p
                    className={`font-semibold text-sm ${
                      entry.amount > 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {entry.amount > 0 ? "+" : ""}
                    {formatMoney(entry.amount, entry.currency)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
