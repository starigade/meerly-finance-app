export const dynamic = "force-dynamic";

import { TransactionForm } from "@/components/transaction-form";
import { getAccounts, getCategories } from "@/lib/actions";

export default async function NewTransactionPage() {
  const [accounts, categories] = await Promise.all([getAccounts(), getCategories()]);

  return (
    <div className="max-w-2xl mx-auto">
      <TransactionForm accounts={accounts} categories={categories} />
    </div>
  );
}
