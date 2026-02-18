export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { TransactionForm } from "@/components/transaction-form";
import { getTransaction, getAccounts, getCategories } from "@/lib/actions";

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [transaction, accounts, categories] = await Promise.all([
    getTransaction(id),
    getAccounts(),
    getCategories(),
  ]);

  if (!transaction) notFound();

  const normalized = {
    ...transaction,
    entries: transaction.transaction_entries ?? [],
  };

  return (
    <div className="max-w-2xl mx-auto">
      <TransactionForm
        accounts={accounts}
        categories={categories}
        editTransaction={normalized as any}
      />
    </div>
  );
}
