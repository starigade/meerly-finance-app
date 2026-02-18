export const dynamic = "force-dynamic";

import { getAccounts, getCategories } from "@/lib/actions";
import { ImportClient } from "./import-client";

export default async function ImportPage() {
  const [accounts, categories] = await Promise.all([
    getAccounts(),
    getCategories(),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-lg font-semibold">Import Transactions</h1>
      <ImportClient accounts={accounts} categories={categories} />
    </div>
  );
}
