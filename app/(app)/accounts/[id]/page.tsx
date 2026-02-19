export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
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
        <Button variant="ghost" size="icon" asChild>
          <Link href="/accounts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">{account.name}</h1>
          <p className="text-xs text-muted-foreground">
            {ACCOUNT_SUB_TYPES[account.sub_type as keyof typeof ACCOUNT_SUB_TYPES]?.label ?? account.sub_type} &middot; {account.currency}
          </p>
        </div>
      </div>

      {/* Balance */}
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Balance</p>
          <p className="text-3xl font-bold font-mono tabular-nums">
            {formatMoney(account.balance, account.currency)}
          </p>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-2">Recent Activity</h2>
          {activeEntries.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">No transactions yet</p>
          ) : (
            <Table>
              <TableBody>
                {activeEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Link href={`/transactions/${entry.transaction.id}`} className="hover:text-primary">
                        <p className="font-medium text-sm">
                          {entry.transaction.description ?? entry.category?.name ?? "Transaction"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(entry.transaction.date)}
                        </p>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-mono tabular-nums text-sm font-medium ${entry.amount > 0 ? "text-success" : "text-destructive"}`}>
                        {entry.amount > 0 ? "+" : ""}
                        {formatMoney(entry.amount, entry.currency)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
