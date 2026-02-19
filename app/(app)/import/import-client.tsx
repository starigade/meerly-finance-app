"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CsvImport } from "@/components/csv-import";
import { getCsvMapping } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import type { Account, Category, CsvColumnMapping, CsvImportResult } from "@/lib/types";

interface ImportClientProps {
  accounts: Account[];
  categories: Category[];
}

export function ImportClient({ accounts, categories }: ImportClientProps) {
  const router = useRouter();
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [savedMapping, setSavedMapping] = useState<CsvColumnMapping | null>(null);
  const [done, setDone] = useState(false);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  // Load saved mapping when account changes
  useEffect(() => {
    if (!selectedAccountId) {
      setSavedMapping(null);
      return;
    }
    getCsvMapping(selectedAccountId).then((result) => {
      if (result.success) setSavedMapping(result.data ?? null);
    });
  }, [selectedAccountId]);

  const assetAccounts = accounts.filter((a) => a.account_type === "asset");
  const liabilityAccounts = accounts.filter((a) => a.account_type === "liability");

  const handleComplete = (result: CsvImportResult) => {
    setDone(true);
  };

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-sm text-muted-foreground mb-3">
            You need at least one account to import transactions.
          </p>
          <Button
            size="sm"
            className="mx-auto"
            onClick={() => router.push("/accounts/new")}
          >
            Create Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Account selector */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Import into account</Label>
        <Select value={selectedAccountId} onValueChange={(v) => { setSelectedAccountId(v); setDone(false); }}>
          <SelectTrigger>
            <SelectValue placeholder="Select an account" />
          </SelectTrigger>
          <SelectContent>
            {assetAccounts.length > 0 && (
              <SelectGroup>
                <SelectLabel>What You Own</SelectLabel>
                {assetAccounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} ({a.currency})
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
            {liabilityAccounts.length > 0 && (
              <SelectGroup>
                <SelectLabel>What You Owe</SelectLabel>
                {liabilityAccounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} ({a.currency})
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Import component */}
      {selectedAccount && !done && (
        <Card>
          <CardContent className="p-6">
            <CsvImport
              account={{
                id: selectedAccount.id,
                name: selectedAccount.name,
                currency: selectedAccount.currency,
              }}
              categories={categories}
              savedMapping={savedMapping}
              onComplete={handleComplete}
            />
          </CardContent>
        </Card>
      )}

      {/* Done state */}
      {done && (
        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => router.push("/transactions")}
          >
            View Transactions
          </Button>
          <Button
            className="flex-1"
            onClick={() => setDone(false)}
          >
            Import More
          </Button>
        </div>
      )}
    </div>
  );
}
