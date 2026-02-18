export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";

export default async function AuditPage() {
  const supabase = await createServerSupabaseClient();

  const { data: imbalanced } = await supabase.rpc("check_imbalanced_transactions");

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
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="btn btn-ghost btn-sm btn-square">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold">Audit</h1>
      </div>

      <div className={`card border ${isBalanced ? "border-success/30" : "border-error/30"}`}>
        <div className="card-body p-8 text-center">
          {isBalanced ? (
            <>
              <CheckCircle className="h-16 w-16 text-success mx-auto mb-3" />
              <h2 className="text-lg font-bold mb-1">Books are balanced!</h2>
              <p className="text-sm text-neutral">
                All transactions have entries that sum to zero. Your double-entry accounting is correct.
              </p>
            </>
          ) : (
            <>
              <AlertTriangle className="h-16 w-16 text-error mx-auto mb-3" />
              <h2 className="text-lg font-bold mb-1">
                {imbalancedCount} imbalanced transaction{imbalancedCount > 1 ? "s" : ""}
              </h2>
              <p className="text-sm text-neutral">
                Some transactions have entries that don&apos;t sum to zero. This indicates a data integrity issue.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4">
          <h2 className="text-sm font-semibold mb-2">How it works</h2>
          <div className="text-sm text-neutral space-y-2">
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
          </div>
        </div>
      </div>
    </div>
  );
}
