"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  Plus,
  Trash2,
  LayoutDashboard,
  Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { CsvImport } from "@/components/csv-import";
import { createAccount } from "@/lib/actions";
import {
  ACCOUNT_SUB_TYPES,
  ASSET_SUB_TYPES,
  LIABILITY_SUB_TYPES,
  COMMON_CURRENCIES,
  DEFAULT_CURRENCY,
} from "@/lib/constants";
import { formatMoney, dollarsToCents } from "@/lib/currency";
import { toast } from "sonner";
import type { AccountSubType, Account, Category, CsvImportResult } from "@/lib/types";

interface OnboardingAccountRow {
  name: string;
  sub_type: AccountSubType;
  currency: string;
  balance: string;
}

interface CreatedAccount {
  id: string;
  name: string;
  balance: number;
  currency: string;
  importCount: number;
}

interface OnboardingWizardProps {
  categories: Category[];
}

export function OnboardingWizard({ categories }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Dynamic account list
  const [accountRows, setAccountRows] = useState<OnboardingAccountRow[]>([
    { name: "", sub_type: "checking", currency: DEFAULT_CURRENCY, balance: "" },
  ]);

  // Step 2: Import data per account
  const [createdAccounts, setCreatedAccounts] = useState<CreatedAccount[]>([]);
  const [importIndex, setImportIndex] = useState(0);

  const addAccountRow = () => {
    setAccountRows((prev) => [
      ...prev,
      { name: "", sub_type: "checking", currency: DEFAULT_CURRENCY, balance: "" },
    ]);
  };

  const removeAccountRow = (index: number) => {
    if (accountRows.length <= 1) return;
    setAccountRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAccountRow = (
    index: number,
    field: keyof OnboardingAccountRow,
    value: string
  ) => {
    setAccountRows((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  };

  // When sub_type changes, auto-set account_type
  const handleSubTypeChange = (index: number, subType: string) => {
    updateAccountRow(index, "sub_type", subType);
  };

  const handleCreateAccounts = async () => {
    const validAccounts = accountRows.filter((a) => a.name.trim());
    if (validAccounts.length === 0) {
      toast.error("Please add at least one account with a name");
      return;
    }

    setLoading(true);
    const created: CreatedAccount[] = [];

    for (const acc of validAccounts) {
      const meta = ACCOUNT_SUB_TYPES[acc.sub_type as AccountSubType];
      const result = await createAccount({
        name: acc.name.trim(),
        account_type: meta.type,
        sub_type: acc.sub_type as AccountSubType,
        currency: acc.currency,
        opening_balance: acc.balance || "0",
      });

      if (result.success && result.data) {
        const balanceCents = dollarsToCents(acc.balance || "0", acc.currency);
        created.push({
          id: result.data.id,
          name: acc.name.trim(),
          balance: balanceCents,
          currency: acc.currency,
          importCount: 0,
        });
      } else {
        toast.error(`Failed to create ${acc.name}: ${result.error}`);
      }
    }

    setCreatedAccounts(created);
    setLoading(false);

    if (created.length > 0) {
      setImportIndex(0);
      setStep(2);
    }
  };

  const handleImportComplete = (result: CsvImportResult) => {
    setCreatedAccounts((prev) =>
      prev.map((a, i) =>
        i === importIndex ? { ...a, importCount: result.imported } : a
      )
    );
  };

  const nextImportOrSummary = () => {
    if (importIndex < createdAccounts.length - 1) {
      setImportIndex((prev) => prev + 1);
    } else {
      setStep(3);
    }
  };

  const totalNetWorth = createdAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalImported = createdAccounts.reduce((sum, a) => sum + a.importCount, 0);
  const hasValidAccount = accountRows.some((a) => a.name.trim());

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* DaisyUI Steps */}
      <ul className="steps steps-horizontal w-full mb-8 text-xs">
        <li className={`step ${step >= 1 ? "step-primary" : ""}`}>Accounts</li>
        <li className={`step ${step >= 2 ? "step-primary" : ""}`}>Import</li>
        <li className={`step ${step >= 3 ? "step-primary" : ""}`}>Summary</li>
      </ul>

      {/* Step 1: Add accounts (dynamic list) */}
      {step === 1 && (
        <div>
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Add Your Accounts</h2>
            <p className="text-neutral text-sm mt-1">
              Add your bank accounts, credit cards, and other financial accounts.
            </p>
          </div>

          <div className="space-y-3">
            {accountRows.map((account, i) => (
              <div
                key={i}
                className="card border border-base-300 bg-base-100"
              >
                <div className="card-body p-3 space-y-2">
                  {/* Name + remove */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 form-control">
                      <Input
                        className="input-sm"
                        placeholder="Account name (e.g. DBS Savings)"
                        value={account.name}
                        onChange={(e) =>
                          updateAccountRow(i, "name", e.target.value)
                        }
                      />
                    </div>
                    {accountRows.length > 1 && (
                      <button
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={() => removeAccountRow(i)}
                      >
                        <Trash2 className="h-4 w-4 text-neutral" />
                      </button>
                    )}
                  </div>

                  {/* Type + Currency + Balance */}
                  <div className="flex gap-2">
                    <div className="flex-1 form-control">
                      <label className="label py-0.5">
                        <span className="label-text text-xs">Type</span>
                      </label>
                      <Select
                        value={account.sub_type}
                        onValueChange={(v) => handleSubTypeChange(i, v)}
                      >
                        <SelectTrigger className="select-sm h-8 min-h-0 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>What You Own</SelectLabel>
                            {ASSET_SUB_TYPES.map((st) => (
                              <SelectItem key={st} value={st}>
                                {ACCOUNT_SUB_TYPES[st].label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>What You Owe</SelectLabel>
                            {LIABILITY_SUB_TYPES.map((st) => (
                              <SelectItem key={st} value={st}>
                                {ACCOUNT_SUB_TYPES[st].label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-24 form-control">
                      <label className="label py-0.5">
                        <span className="label-text text-xs">Currency</span>
                      </label>
                      <Select
                        value={account.currency}
                        onValueChange={(v) =>
                          updateAccountRow(i, "currency", v)
                        }
                      >
                        <SelectTrigger className="select-sm h-8 min-h-0 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMON_CURRENCIES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-28 form-control">
                      <label className="label py-0.5">
                        <span className="label-text text-xs">Balance</span>
                      </label>
                      <Input
                        className="input-sm"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={account.balance}
                        onChange={(e) =>
                          updateAccountRow(i, "balance", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add another */}
          <button
            className="btn btn-ghost btn-sm w-full mt-3 gap-1"
            onClick={addAccountRow}
          >
            <Plus className="h-4 w-4" />
            Add another account
          </button>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              className="btn btn-ghost flex-1"
              onClick={() => {
                setCreatedAccounts([]);
                setStep(3);
              }}
            >
              Skip for now
            </button>
            <button
              className="btn btn-primary flex-1 gap-2"
              onClick={handleCreateAccounts}
              disabled={loading || !hasValidAccount}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Import data per account */}
      {step === 2 && createdAccounts.length > 0 && (
        <div>
          {/* Progress indicator */}
          {createdAccounts.length > 1 && (
            <div className="text-center mb-4">
              <p className="text-xs text-neutral">
                Account {importIndex + 1} of {createdAccounts.length}
              </p>
              <progress
                className="progress progress-primary w-full h-1.5 mt-1"
                value={importIndex + 1}
                max={createdAccounts.length}
              />
            </div>
          )}

          <CsvImport
            account={{
              id: createdAccounts[importIndex].id,
              name: createdAccounts[importIndex].name,
              currency: createdAccounts[importIndex].currency,
            }}
            categories={categories}
            onComplete={handleImportComplete}
            onSkip={nextImportOrSummary}
          />

          {/* Navigation after import results show */}
          <div className="flex gap-3 mt-4">
            <button
              className="btn btn-ghost flex-1"
              onClick={() => setStep(3)}
            >
              Skip all imports
            </button>
            <button
              className="btn btn-primary flex-1 gap-2"
              onClick={nextImportOrSummary}
            >
              {importIndex < createdAccounts.length - 1
                ? "Next Account"
                : "See Summary"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Summary */}
      {step === 3 && (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-success" />
            </div>
          </div>

          <h2 className="text-xl font-bold mb-1">You&apos;re all set!</h2>

          {createdAccounts.length > 0 ? (
            <>
              <p className="text-neutral text-sm mb-6">
                {createdAccounts.length} account
                {createdAccounts.length !== 1 ? "s" : ""} created
                {totalImported > 0 && ` with ${totalImported} transactions imported`}
              </p>

              {/* Net worth */}
              <div className="card bg-base-100 border border-base-300 mb-4">
                <div className="card-body p-5">
                  <p className="text-xs text-neutral uppercase tracking-wider mb-1">
                    Net Worth
                  </p>
                  <p
                    className={`text-3xl font-bold font-mono tabular-nums ${
                      totalNetWorth >= 0 ? "text-success" : "text-error"
                    }`}
                  >
                    {formatMoney(totalNetWorth, DEFAULT_CURRENCY)}
                  </p>
                </div>
              </div>

              {/* Account list */}
              <div className="card bg-base-100 border border-base-300 mb-6">
                <div className="card-body p-0">
                  <table className="table table-sm">
                    <tbody>
                      {createdAccounts.map((acc) => (
                        <tr key={acc.id}>
                          <td className="font-medium text-sm">{acc.name}</td>
                          <td className="text-right text-xs text-neutral">
                            {acc.importCount > 0 && (
                              <span className="badge badge-ghost badge-xs mr-2">
                                {acc.importCount} imported
                              </span>
                            )}
                          </td>
                          <td className="text-right font-mono tabular-nums text-sm">
                            {formatMoney(acc.balance, acc.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <p className="text-neutral text-sm mb-8">
              No worries! You can add accounts later from the Accounts page.
            </p>
          )}

          <div className="space-y-2">
            <button
              className="btn btn-primary w-full gap-2"
              onClick={() => router.push("/")}
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </button>
            <button
              className="btn btn-ghost w-full gap-2"
              onClick={() => router.push("/transactions/new")}
            >
              <Plus className="h-4 w-4" />
              Add First Transaction
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
