"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Landmark,
  PiggyBank,
  CreditCard,
  TrendingUp,
  Banknote,
  CircleCheck,
  ArrowRight,
  Sparkles,
  Plus,
  LayoutDashboard,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAccount } from "@/lib/actions";
import { ONBOARDING_ACCOUNT_TEMPLATES, COMMON_CURRENCIES, DEFAULT_CURRENCY } from "@/lib/constants";
import { formatMoney, dollarsToCents } from "@/lib/currency";
import { toast } from "sonner";
import type { AccountSubType } from "@/lib/types";

// Map icon strings to actual Lucide components
const ACCOUNT_ICONS: Record<string, React.ElementType> = {
  landmark: Landmark,
  "piggy-bank": PiggyBank,
  "credit-card": CreditCard,
  "trending-up": TrendingUp,
  banknote: Banknote,
};

interface OnboardingAccount {
  name: string;
  sub_type: AccountSubType;
  currency: string;
  balance: string;
  enabled: boolean;
}

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<OnboardingAccount[]>(
    ONBOARDING_ACCOUNT_TEMPLATES.map((t) => ({
      name: t.name,
      sub_type: t.sub_type,
      currency: DEFAULT_CURRENCY,
      balance: "",
      enabled: false,
    }))
  );
  const [createdAccounts, setCreatedAccounts] = useState<
    { name: string; balance: number; currency: string }[]
  >([]);

  const toggleAccount = (index: number) => {
    setAccounts((prev) =>
      prev.map((a, i) => (i === index ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const updateAccount = (index: number, field: keyof OnboardingAccount, value: string) => {
    setAccounts((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  };

  const handleCreateAccounts = async () => {
    const enabledAccounts = accounts.filter((a) => a.enabled && a.name.trim());
    if (enabledAccounts.length === 0) {
      toast.error("Please select at least one account");
      return;
    }

    setLoading(true);
    const created: { name: string; balance: number; currency: string }[] = [];

    for (const acc of enabledAccounts) {
      const isLiability = ["credit_card", "mortgage", "student_loan", "personal_loan", "other_liability"].includes(acc.sub_type);
      const result = await createAccount({
        name: acc.name,
        account_type: isLiability ? "liability" : "asset",
        sub_type: acc.sub_type,
        currency: acc.currency,
        opening_balance: acc.balance || "0",
      });

      if (result.success) {
        const balanceCents = dollarsToCents(acc.balance || "0", acc.currency);
        created.push({ name: acc.name, balance: balanceCents, currency: acc.currency });
      } else {
        toast.error(`Failed to create ${acc.name}: ${result.error}`);
      }
    }

    setCreatedAccounts(created);
    setLoading(false);
    setStep(2);
  };

  const enabledCount = accounts.filter((a) => a.enabled).length;
  const totalNetWorth = createdAccounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* DaisyUI Steps */}
      <ul className="steps steps-horizontal w-full mb-8 text-xs">
        <li className={`step ${step >= 1 ? "step-primary" : ""}`}>Accounts</li>
        <li className={`step ${step >= 2 ? "step-primary" : ""}`}>Overview</li>
        <li className={`step ${step >= 3 ? "step-primary" : ""}`}>Ready</li>
      </ul>

      {/* Step 1: Add accounts */}
      {step === 1 && (
        <div>
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">What accounts do you have?</h2>
            <p className="text-neutral text-sm mt-1">
              Select your accounts and enter current balances.
              You can always add more later.
            </p>
          </div>

          <div className="space-y-2">
            {accounts.map((account, i) => {
              const IconComponent = ACCOUNT_ICONS[ONBOARDING_ACCOUNT_TEMPLATES[i].icon] ?? Landmark;
              return (
                <div
                  key={i}
                  className={`card border transition-all cursor-pointer ${
                    account.enabled
                      ? "border-primary bg-primary/[0.03] shadow-sm"
                      : "border-base-300 hover:border-base-content/20"
                  }`}
                >
                  <div className="card-body p-3">
                    {/* Row: checkbox + icon + name + description */}
                    <div
                      className="flex items-center gap-3"
                      onClick={() => toggleAccount(i)}
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
                        checked={account.enabled}
                        onChange={() => toggleAccount(i)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        account.enabled ? "bg-primary text-primary-content" : "bg-base-200 text-neutral"
                      }`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight">{account.name}</p>
                        <p className="text-xs text-neutral leading-tight mt-0.5">
                          {ONBOARDING_ACCOUNT_TEMPLATES[i].description}
                        </p>
                      </div>
                    </div>

                    {/* Expanded: edit fields */}
                    {account.enabled && (
                      <div className="mt-3 ml-[4.25rem] space-y-2">
                        <div className="form-control">
                          <label className="label py-0.5">
                            <span className="label-text text-xs">Account Name</span>
                          </label>
                          <Input
                            className="input-sm"
                            value={account.name}
                            onChange={(e) => updateAccount(i, "name", e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 form-control">
                            <label className="label py-0.5">
                              <span className="label-text text-xs">Current Balance</span>
                            </label>
                            <Input
                              className="input-sm"
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={account.balance}
                              onChange={(e) => updateAccount(i, "balance", e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="w-28 form-control">
                            <label className="label py-0.5">
                              <span className="label-text text-xs">Currency</span>
                            </label>
                            <Select
                              value={account.currency}
                              onValueChange={(v) => updateAccount(i, "currency", v)}
                            >
                              <SelectTrigger className="select-sm h-8 min-h-0 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {COMMON_CURRENCIES.map((c) => (
                                  <SelectItem key={c.code} value={c.code}>
                                    {c.code} ({c.symbol})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              className="btn btn-ghost flex-1"
              onClick={() => { setStep(2); setCreatedAccounts([]); }}
            >
              Skip for now
            </button>
            <button
              className="btn btn-primary flex-1 gap-2"
              onClick={handleCreateAccounts}
              disabled={loading || enabledCount === 0}
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

      {/* Step 2: Net worth reveal */}
      {step === 2 && (
        <div className="text-center">
          {createdAccounts.length > 0 ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-1">Your Starting Net Worth</h2>
                <p className="text-neutral text-sm">
                  {createdAccounts.length} account{createdAccounts.length !== 1 ? "s" : ""} set up
                </p>
              </div>

              <div className="card bg-base-100 border border-base-300 mb-6">
                <div className="card-body p-6">
                  <p className="text-xs text-neutral uppercase tracking-wider mb-1">Net Worth</p>
                  <p className={`text-4xl font-bold font-mono tabular-nums ${totalNetWorth >= 0 ? "text-success" : "text-error"}`}>
                    {formatMoney(totalNetWorth, DEFAULT_CURRENCY)}
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 border border-base-300 mb-6">
                <div className="card-body p-0">
                  <table className="table table-sm">
                    <tbody>
                      {createdAccounts.map((acc, i) => (
                        <tr key={i}>
                          <td className="font-medium text-sm">{acc.name}</td>
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
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">No accounts yet</h2>
              <p className="text-neutral text-sm">
                No worries! You can add accounts later from the Accounts page.
              </p>
            </div>
          )}

          <button
            className="btn btn-primary w-full gap-2"
            onClick={() => setStep(3)}
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 3 && (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-success" />
            </div>
          </div>

          <h2 className="text-xl font-bold mb-1">You&apos;re all set!</h2>
          <p className="text-neutral text-sm mb-8">
            Start tracking your finances by adding your first transaction,
            or explore your dashboard.
          </p>

          <div className="space-y-2">
            <button
              className="btn btn-primary w-full gap-2"
              onClick={() => router.push("/transactions/new")}
            >
              <Plus className="h-4 w-4" />
              Add First Transaction
            </button>
            <button
              className="btn btn-ghost w-full gap-2"
              onClick={() => router.push("/")}
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
