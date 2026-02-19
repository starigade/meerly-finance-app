"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTransaction } from "@/lib/actions";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Account, Category, TransactionUIType } from "@/lib/types";

interface QuickAddProps {
  accounts: Account[];
  categories: Category[];
}

export function QuickAdd({ accounts, categories }: QuickAddProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uiType, setUiType] = useState<TransactionUIType>("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [description, setDescription] = useState("");

  const expenseCategories = categories.filter((c) => c.category_type === "expense" && c.is_active);
  const incomeCategories = categories.filter((c) => c.category_type === "income" && c.is_active);
  const activeAccounts = accounts.filter((a) => a.is_active);

  useEffect(() => {
    if (open) {
      setAmount("");
      setCategoryId("");
      setDescription("");
      if (activeAccounts.length > 0 && !accountId) {
        setAccountId(activeAccounts[0].id);
      }
    }
  }, [open]);

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const currency = selectedAccount?.currency ?? DEFAULT_CURRENCY;

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Enter an amount");
      return;
    }
    if (!categoryId) {
      toast.error("Select a category");
      return;
    }
    if (!accountId) {
      toast.error("Select an account");
      return;
    }

    setLoading(true);
    const selectedCategory = categories.find((c) => c.id === categoryId);

    const result = await createTransaction({
      ui_type: uiType,
      date: new Date().toISOString().split("T")[0],
      description: description || selectedCategory?.name || "",
      category_id: categoryId,
      account_id: accountId,
      amount,
      currency,
    });

    if (result.success) {
      toast.success("Added!");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to add");
    }
    setLoading(false);
  };

  const relevantCategories = uiType === "expense" ? expenseCategories : incomeCategories;

  return (
    <>
      {/* FAB */}
      <Button
        size="icon"
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-30 rounded-full h-14 w-14 shadow-elevated"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Quick-add dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Add</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {/* Type toggle */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={uiType === "expense" ? "default" : "outline"}
                className="flex-1"
                onClick={() => { setUiType("expense"); setCategoryId(""); }}
              >
                Expense
              </Button>
              <Button
                size="sm"
                variant={uiType === "income" ? "default" : "outline"}
                className="flex-1"
                onClick={() => { setUiType("income"); setCategoryId(""); }}
              >
                Income
              </Button>
            </div>

            {/* Amount */}
            <div>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl font-bold font-mono h-16 text-center"
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center mt-1">{currency}</p>
            </div>

            {/* Category */}
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {relevantCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: c.color ?? "#6b7280" }}
                      />
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Account */}
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder={uiType === "expense" ? "From account" : "To account"} />
              </SelectTrigger>
              <SelectContent>
                {activeAccounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} ({a.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Description */}
            <Input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Button className="w-full" onClick={handleSubmit} disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
