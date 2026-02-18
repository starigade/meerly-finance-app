export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, CheckCircle, AlertTriangle } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";

export default async function AuditPage() {
  const supabase = createServerSupabaseClient();

  // Check for imbalanced transactions
  const { data: imbalanced } = await supabase.rpc("check_imbalanced_transactions");

  // Fallback: direct query if RPC doesn't exist yet
  let imbalancedCount = 0;
  if (imbalanced === null) {
    const { data: entries } = await supabase
      .from("transaction_entries")
      .select("transaction_id, base_amount");

    if (entries) {
      const sums = new Map<string, number>();
      for (const e of entries) {
        sums.set(e.transaction_id, (sums.get(e.transaction_id) ?? 0) + e.base_amount);
      }
      imbalancedCount = [...sums.values()].filter((s) => s !== 0).length;
    }
  } else {
    imbalancedCount = Array.isArray(imbalanced) ? imbalanced.length : 0;
  }

  const isBalanced = imbalancedCount === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit</h1>
        <p className="text-sm text-muted">Verify your accounting data integrity</p>
      </div>

      <Card className={isBalanced ? "border-success/30" : "border-danger/30"}>
        <CardContent className="p-8 text-center">
          {isBalanced ? (
            <>
              <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Books are balanced!</h2>
              <p className="text-muted">
                All transactions have entries that sum to zero. Your double-entry accounting is correct.
              </p>
            </>
          ) : (
            <>
              <AlertTriangle className="h-16 w-16 text-danger mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {imbalancedCount} imbalanced transaction{imbalancedCount > 1 ? "s" : ""}
              </h2>
              <p className="text-muted">
                Some transactions have entries that don&apos;t sum to zero. This indicates a data integrity issue.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted space-y-2">
          <p>
            Every transaction in Meerly uses double-entry accounting. This means each transaction has
            two or more entries that must sum to exactly zero in the base currency.
          </p>
          <p>
            For example, a S$50 grocery expense creates two entries: +S$50 to the Groceries category
            and -S$50 from your checking account. The sum is zero.
          </p>
          <p>
            This audit checks that all transactions follow this rule. If any don&apos;t, it likely means
            a bug created an incomplete transaction.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
