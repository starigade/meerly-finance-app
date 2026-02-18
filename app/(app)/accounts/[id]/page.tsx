export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";
import { formatMoney } from "@/lib/currency";
import { formatDate } from "@/lib/dates";
import { ACCOUNT_SUB_TYPES } from "@/lib/constants";

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: account } = await supabase
    .from("account_balances")
    .select("*")
    .eq("account_id", id)
    .single();

  if (!account) notFound();

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
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/accounts" className="btn btn-ghost btn-sm btn-square">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold">{account.name}</h1>
          <p className="text-xs text-neutral">
            {ACCOUNT_SUB_TYPES[account.sub_type as keyof typeof ACCOUNT_SUB_TYPES]?.label ?? account.sub_type} &middot; {account.currency}
          </p>
        </div>
      </div>

      {/* Balance */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-6 text-center">
          <p className="text-xs text-neutral uppercase tracking-wider mb-1">Current Balance</p>
          <p className="text-3xl font-bold font-mono tabular-nums">
            {formatMoney(account.balance, account.currency)}
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4">
          <h2 className="text-sm font-semibold mb-2">Recent Activity</h2>
          {activeEntries.length === 0 ? (
            <p className="text-center text-neutral py-6 text-sm">No transactions yet</p>
          ) : (
            <table className="table table-sm">
              <tbody>
                {activeEntries.map((entry) => (
                  <tr key={entry.id} className="hover">
                    <td>
                      <Link href={`/transactions/${entry.transaction.id}`} className="hover:text-primary">
                        <p className="font-medium text-sm">
                          {entry.transaction.description ?? entry.category?.name ?? "Transaction"}
                        </p>
                        <p className="text-xs text-neutral">
                          {formatDate(entry.transaction.date)}
                        </p>
                      </Link>
                    </td>
                    <td className="text-right">
                      <span className={`font-mono tabular-nums text-sm font-medium ${entry.amount > 0 ? "text-success" : "text-error"}`}>
                        {entry.amount > 0 ? "+" : ""}
                        {formatMoney(entry.amount, entry.currency)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
