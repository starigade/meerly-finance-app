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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
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
import { cn } from "@/lib/utils";
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

const STEPS = [
  { num: 1, label: "Accounts" },
  { num: 2, label: "Import" },
  { num: 3, label: "Summary" },
];

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
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-6 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            {i > 0 && (
              <div className={cn(
                "w-8 h-0.5 -ml-4 mr-2",
                step >= s.num ? "bg-primary" : "bg-muted"
              )} />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium",
                  step >= s.num
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {s.num}
              </div>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Add accounts (dynamic list) */}
      {step === 1 && (
        <div>
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Add Your Accounts</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Add your bank accounts, credit cards, and other financial accounts.
            </p>
          </div>

          <div className="space-y-3">
            {accountRows.map((account, i) => (
              <Card key={i}>
                <CardContent className="p-3 space-y-2">
                  {/* Name + remove */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        className="h-8 text-sm"
                        placeholder="Account name (e.g. DBS Savings)"
                        value={account.name}
                        onChange={(e) =>
                          updateAccountRow(i, "name", e.target.value)
                        }
                      />
                    </div>
                    {accountRows.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAccountRow(i)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>

                  {/* Type + Currency + Balance */}
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={account.sub_type}
                        onValueChange={(v) => handleSubTypeChange(i, v)}
                      >
                        <SelectTrigger className="h-8 min-h-0 text-xs">
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

                    <div className="w-24 space-y-1">
                      <Label className="text-xs">Currency</Label>
                      <Select
                        value={account.currency}
                        onValueChange={(v) =>
                          updateAccountRow(i, "currency", v)
                        }
                      >
                        <SelectTrigger className="h-8 min-h-0 text-xs">
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

                    <div className="w-28 space-y-1">
                      <Label className="text-xs">Balance</Label>
                      <Input
                        className="h-8 text-sm"
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
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add another */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 gap-1"
            onClick={addAccountRow}
          >
            <Plus className="h-4 w-4" />
            Add another account
          </Button>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setCreatedAccounts([]);
                setStep(3);
              }}
            >
              Skip for now
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleCreateAccounts}
              disabled={loading || !hasValidAccount}
            >
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Import data per account */}
      {step === 2 && createdAccounts.length > 0 && (
        <div>
          {/* Progress indicator */}
          {createdAccounts.length > 1 && (
            <div className="text-center mb-4">
              <p className="text-xs text-muted-foreground">
                Account {importIndex + 1} of {createdAccounts.length}
              </p>
              <Progress
                className="h-1.5 mt-1"
                value={((importIndex + 1) / createdAccounts.length) * 100}
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
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setStep(3)}
            >
              Skip all imports
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={nextImportOrSummary}
            >
              {importIndex < createdAccounts.length - 1
                ? "Next Account"
                : "See Summary"}
              <ArrowRight className="h-4 w-4" />
            </Button>
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
              <p className="text-muted-foreground text-sm mb-6">
                {createdAccounts.length} account
                {createdAccounts.length !== 1 ? "s" : ""} created
                {totalImported > 0 && ` with ${totalImported} transactions imported`}
              </p>

              {/* Net worth */}
              <Card className="mb-4">
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Net Worth
                  </p>
                  <p
                    className={`text-3xl font-bold font-mono tabular-nums ${
                      totalNetWorth >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {formatMoney(totalNetWorth, DEFAULT_CURRENCY)}
                  </p>
                </CardContent>
              </Card>

              {/* Account list */}
              <Card className="mb-6">
                <CardContent className="p-0">
                  <Table>
                    <TableBody>
                      {createdAccounts.map((acc) => (
                        <TableRow key={acc.id}>
                          <TableCell className="font-medium text-sm">{acc.name}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {acc.importCount > 0 && (
                              <Badge variant="secondary" className="text-[10px] mr-2">
                                {acc.importCount} imported
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums text-sm">
                            {formatMoney(acc.balance, acc.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <p className="text-muted-foreground text-sm mb-8">
              No worries! You can add accounts later from the Accounts page.
            </p>
          )}

          <div className="space-y-2">
            <Button
              className="w-full gap-2"
              onClick={() => router.push("/")}
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full gap-2"
              onClick={() => router.push("/transactions/new")}
            >
              <Plus className="h-4 w-4" />
              Add First Transaction
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
