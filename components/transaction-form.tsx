"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectSeparator,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createTransaction, updateTransaction } from "@/lib/actions";
import { COMMON_CURRENCIES, DEFAULT_CURRENCY, TRANSACTION_TYPE_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import type { Account, Category, TransactionUIType, TransactionWithEntries } from "@/lib/types";

interface TransactionFormProps {
  accounts: Account[];
  categories: Category[];
  editTransaction?: TransactionWithEntries;
}

export function TransactionForm({ accounts, categories, editTransaction }: TransactionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isEdit = !!editTransaction;

  // Derive initial values from edit transaction
  const initialType = editTransaction?.ui_type ?? "expense";
  const [uiType, setUiType] = useState<TransactionUIType>(initialType);
  const [date, setDate] = useState(
    editTransaction?.date ?? new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState(editTransaction?.description ?? "");
  const [notes, setNotes] = useState(editTransaction?.notes ?? "");
  const [amount, setAmount] = useState(() => {
    if (!editTransaction?.entries?.length) return "";
    const entry = editTransaction.entries.find((e) => e.category_id || e.amount > 0);
    if (!entry) return "";
    return (Math.abs(entry.amount) / 100).toString();
  });
  const [currency, setCurrency] = useState(() => {
    if (!editTransaction?.entries?.length) return DEFAULT_CURRENCY;
    return editTransaction.entries[0]?.currency ?? DEFAULT_CURRENCY;
  });
  const [categoryId, setCategoryId] = useState(() => {
    if (!editTransaction?.entries?.length) return "";
    return editTransaction.entries.find((e) => e.category_id)?.category_id ?? "";
  });
  const [accountId, setAccountId] = useState(() => {
    if (!editTransaction?.entries?.length) return "";
    return editTransaction.entries.find((e) => e.account_id)?.account_id ?? "";
  });
  const [fromAccountId, setFromAccountId] = useState(() => {
    if (!editTransaction?.entries?.length || editTransaction.ui_type !== "transfer") return "";
    return editTransaction.entries.find((e) => e.amount < 0)?.account_id ?? "";
  });
  const [toAccountId, setToAccountId] = useState(() => {
    if (!editTransaction?.entries?.length || editTransaction.ui_type !== "transfer") return "";
    return editTransaction.entries.find((e) => e.amount > 0)?.account_id ?? "";
  });

  const incomeCategories = categories.filter((c) => c.category_type === "income" && c.is_active);
  const expenseCategories = categories.filter((c) => c.category_type === "expense" && c.is_active);
  const activeAccounts = accounts.filter((a) => a.is_active);

  // Auto-set currency from selected account
  useEffect(() => {
    if (uiType === "transfer" && fromAccountId) {
      const acc = accounts.find((a) => a.id === fromAccountId);
      if (acc) setCurrency(acc.currency);
    } else if (accountId) {
      const acc = accounts.find((a) => a.id === accountId);
      if (acc) setCurrency(acc.currency);
    }
  }, [accountId, fromAccountId, uiType, accounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter an amount");
      return;
    }

    setLoading(true);

    const formData = {
      ui_type: uiType,
      date,
      description: description || (uiType === "transfer" ? "Transfer" : ""),
      notes: notes || undefined,
      category_id: uiType !== "transfer" ? categoryId : undefined,
      account_id: uiType !== "transfer" ? accountId : undefined,
      amount,
      currency,
      from_account_id: uiType === "transfer" ? fromAccountId : undefined,
      to_account_id: uiType === "transfer" ? toAccountId : undefined,
    };

    const result = isEdit
      ? await updateTransaction(editTransaction.id, formData)
      : await createTransaction(formData);

    if (result.success) {
      toast.success(isEdit ? "Transaction updated" : "Transaction added");
      router.push("/transactions");
    } else {
      toast.error(result.error ?? "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Transaction" : "New Transaction"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction type tabs */}
          <Tabs
            value={uiType}
            onValueChange={(v) => setUiType(v as TransactionUIType)}
          >
            <TabsList className="w-full">
              <TabsTrigger value="expense" className="flex-1">Expense</TabsTrigger>
              <TabsTrigger value="income" className="flex-1">Income</TabsTrigger>
              <TabsTrigger value="transfer" className="flex-1">Transfer</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Amount + Currency */}
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-xl font-bold h-14"
                autoFocus
                required
              />
            </div>
            <div className="w-24 space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-14">
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
          </div>

          {/* Category (expense/income only) */}
          {uiType !== "transfer" && (
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {uiType === "expense" ? (
                    expenseCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: c.color ?? "#6b7280" }}
                          />
                          {c.name}
                        </span>
                      </SelectItem>
                    ))
                  ) : (
                    incomeCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: c.color ?? "#6b7280" }}
                          />
                          {c.name}
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Account (expense/income) */}
          {uiType !== "transfer" && (
            <div className="space-y-2">
              <Label>{uiType === "expense" ? "From Account" : "To Account"}</Label>
              <Select value={accountId} onValueChange={setAccountId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {activeAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} ({a.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* From/To accounts (transfer) */}
          {uiType === "transfer" && (
            <>
              <div className="space-y-2">
                <Label>From Account</Label>
                <Select value={fromAccountId} onValueChange={setFromAccountId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeAccounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} ({a.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To Account</Label>
                <Select value={toAccountId} onValueChange={setToAccountId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeAccounts
                      .filter((a) => a.id !== fromAccountId)
                      .map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name} ({a.currency})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading
                ? isEdit
                  ? "Saving..."
                  : "Adding..."
                : isEdit
                  ? "Save Changes"
                  : "Add Transaction"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
