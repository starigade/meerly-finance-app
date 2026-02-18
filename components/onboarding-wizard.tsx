"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, TrendingUp, Receipt, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAccount, createTransaction } from "@/lib/actions";
import { ONBOARDING_ACCOUNT_TEMPLATES, COMMON_CURRENCIES, DEFAULT_CURRENCY } from "@/lib/constants";
import { formatMoney, dollarsToCents } from "@/lib/currency";
import { toast } from "sonner";
import type { AccountSubType } from "@/lib/types";

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

  const totalNetWorth = createdAccounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all ${
              s === step ? "w-8 bg-brand-500" : s < step ? "w-8 bg-brand-300" : "w-8 bg-surface-tertiary"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Add accounts */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 mb-3">
              <Wallet className="h-6 w-6 text-brand-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">What accounts do you have?</h2>
            <p className="text-muted mt-1">Select your accounts and enter current balances</p>
          </div>

          <div className="space-y-3">
            {accounts.map((account, i) => (
              <Card
                key={i}
                className={`cursor-pointer transition-all ${
                  account.enabled
                    ? "ring-2 ring-brand-400 border-brand-400"
                    : "hover:border-brand-200"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3" onClick={() => toggleAccount(i)}>
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                        account.enabled
                          ? "bg-brand-500 border-brand-500"
                          : "border-surface-tertiary"
                      }`}
                    >
                      {account.enabled && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <span className="font-medium flex-1">{account.name}</span>
                  </div>

                  {account.enabled && (
                    <div className="mt-3 pl-9 space-y-3">
                      <div>
                        <Label className="text-xs">Account Name</Label>
                        <Input
                          value={account.name}
                          onChange={(e) => updateAccount(i, "name", e.target.value)}
                          className="mt-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label className="text-xs">Current Balance</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={account.balance}
                            onChange={(e) => updateAccount(i, "balance", e.target.value)}
                            className="mt-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="w-28">
                          <Label className="text-xs">Currency</Label>
                          <Select
                            value={account.currency}
                            onValueChange={(v) => updateAccount(i, "currency", v)}
                          >
                            <SelectTrigger className="mt-1">
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
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => { setStep(2); setCreatedAccounts([]); }}>
              Skip for now
            </Button>
            <Button className="flex-1" onClick={handleCreateAccounts} disabled={loading}>
              {loading ? "Creating..." : "Continue"}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Net worth reveal */}
      {step === 2 && (
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-success-light mb-3">
            <TrendingUp className="h-6 w-6 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {createdAccounts.length > 0 ? "Your Net Worth" : "Let's get started!"}
          </h2>

          {createdAccounts.length > 0 ? (
            <>
              <div className="text-5xl font-bold text-success py-4">
                {formatMoney(totalNetWorth, DEFAULT_CURRENCY)}
              </div>
              <div className="space-y-2">
                {createdAccounts.map((acc, i) => (
                  <div key={i} className="flex justify-between text-sm px-4">
                    <span className="text-muted">{acc.name}</span>
                    <span className="font-medium">
                      {formatMoney(acc.balance, acc.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted">
              You can add accounts later from the Accounts page.
            </p>
          )}

          <Button className="w-full" onClick={() => setStep(3)}>
            Continue
          </Button>
        </div>
      )}

      {/* Step 3: Add first expense */}
      {step === 3 && (
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 mb-3">
            <Receipt className="h-6 w-6 text-brand-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">You&apos;re all set!</h2>
          <p className="text-muted">
            Start tracking your finances by adding your first transaction.
          </p>

          <div className="space-y-3">
            <Button className="w-full" onClick={() => router.push("/transactions/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Transaction
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => router.push("/")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
