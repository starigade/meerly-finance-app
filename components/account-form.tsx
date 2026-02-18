"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue, SelectGroup, SelectSeparator } from "@/components/ui/select";
import { createAccount } from "@/lib/actions";
import { ASSET_SUB_TYPES, LIABILITY_SUB_TYPES, ACCOUNT_SUB_TYPES, COMMON_CURRENCIES, DEFAULT_CURRENCY } from "@/lib/constants";
import { toast } from "sonner";
import type { AccountSubType } from "@/lib/types";

export function AccountForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [subType, setSubType] = useState<AccountSubType>("checking");
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [balance, setBalance] = useState("");
  const [notes, setNotes] = useState("");

  const accountType = ACCOUNT_SUB_TYPES[subType].type;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Account name is required");
      return;
    }

    setLoading(true);
    const result = await createAccount({
      name: name.trim(),
      account_type: accountType,
      sub_type: subType,
      currency,
      opening_balance: balance || "0",
      notes: notes || undefined,
    });

    if (result.success) {
      toast.success(`${name} created`);
      router.push("/accounts");
    } else {
      toast.error(result.error ?? "Failed to create account");
    }
    setLoading(false);
  };

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4">
        <h2 className="text-lg font-semibold mb-3">Add Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              placeholder="e.g., DBS Checking"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-control">
            <Label>Account Type</Label>
            <Select value={subType} onValueChange={(v) => setSubType(v as AccountSubType)}>
              <SelectTrigger>
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
                <SelectSeparator />
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

          <div className="flex gap-3">
            <div className="flex-1 form-control">
              <Label htmlFor="balance">Current Balance</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
              />
            </div>
            <div className="w-32 form-control">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
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

          <div className="form-control">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="Any additional details"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" className="btn btn-ghost flex-1" onClick={() => router.back()}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm"></span> : "Add Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
