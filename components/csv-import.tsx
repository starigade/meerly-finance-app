"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Check, AlertCircle } from "lucide-react";
import { CsvColumnMapper } from "./csv-column-mapper";
import { CsvPreviewTable } from "./csv-preview-table";
import { parseCsvFile, applyMapping } from "@/lib/csv-parser";
import { bulkCreateTransactions, checkDuplicateHashes, saveCsvMapping } from "@/lib/actions";
import { formatMoney } from "@/lib/currency";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CsvColumnMapping, CsvParsedRow, CsvImportResult, Account, Category } from "@/lib/types";

type ImportStep = "upload" | "map" | "preview" | "results";

interface CsvImportProps {
  account: Pick<Account, "id" | "name" | "currency">;
  categories: Category[];
  savedMapping?: CsvColumnMapping | null;
  onComplete?: (result: CsvImportResult) => void;
  onSkip?: () => void;
}

export function CsvImport({
  account,
  categories,
  savedMapping,
  onComplete,
  onSkip,
}: CsvImportProps) {
  const [step, setStep] = useState<ImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<CsvColumnMapping | null>(null);
  const [parsedRows, setParsedRows] = useState<CsvParsedRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [defaultCategoryId, setDefaultCategoryId] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<CsvImportResult | null>(null);

  // Step 1: File upload
  const handleFileSelect = useCallback(async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const { headers: h, rows: r } = await parseCsvFile(selectedFile);
      if (h.length === 0) {
        toast.error("CSV file appears to be empty or has no headers");
        return;
      }
      setHeaders(h);
      setRawRows(r);
      setStep("map");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to parse CSV file");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile?.name.endsWith(".csv")) {
        handleFileSelect(droppedFile);
      } else {
        toast.error("Please drop a .csv file");
      }
    },
    [handleFileSelect]
  );

  // Step 2: Column mapping confirmed
  const handleMappingConfirm = useCallback(
    async (m: CsvColumnMapping) => {
      setMapping(m);
      try {
        const rows = await applyMapping(rawRows, m, account.currency);
        if (rows.length === 0) {
          toast.error("No valid rows found with this mapping. Check your column selection and date format.");
          return;
        }

        // Check for duplicates
        const hashes = rows.map((r) => r.importHash);
        const dupResult = await checkDuplicateHashes(hashes);
        const existingHashes = dupResult.data ?? new Set<string>();

        const withDuplicates = rows.map((r) => ({
          ...r,
          isDuplicate: existingHashes.has(r.importHash),
        }));

        setParsedRows(withDuplicates);

        // Auto-select non-duplicate rows
        const selected = new Set<number>();
        withDuplicates.forEach((r, i) => {
          if (!r.isDuplicate) selected.add(i);
        });
        setSelectedRows(selected);

        // Auto-set category: default to first expense category
        if (!defaultCategoryId) {
          const firstExpense = categories.find(
            (c) => c.category_type === "expense" && c.is_active
          );
          if (firstExpense) setDefaultCategoryId(firstExpense.id);
        }

        setStep("preview");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to parse rows");
      }
    },
    [rawRows, account.currency, defaultCategoryId, categories]
  );

  // Step 3: Import confirmed
  const handleImport = useCallback(async () => {
    if (!defaultCategoryId) {
      toast.error("Please select a default category");
      return;
    }

    setImporting(true);
    try {
      const rowsToImport = parsedRows
        .filter((_, i) => selectedRows.has(i))
        .map((r) => ({
          date: r.date,
          description: r.description,
          amountCents: r.amountCents,
          importHash: r.importHash,
        }));

      const importResult = await bulkCreateTransactions({
        account_id: account.id,
        category_id: defaultCategoryId,
        currency: account.currency,
        transactions: rowsToImport,
      });

      if (!importResult.success) {
        toast.error(importResult.error ?? "Import failed");
        setImporting(false);
        return;
      }

      // Save mapping for future use
      if (mapping) {
        await saveCsvMapping({ account_id: account.id, mapping });
      }

      setResult(importResult.data ?? null);
      setStep("results");
      onComplete?.(importResult.data!);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }, [parsedRows, selectedRows, defaultCategoryId, account, mapping, onComplete]);

  const toggleRow = (index: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === parsedRows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(parsedRows.map((_, i) => i)));
    }
  };

  return (
    <div className="w-full">
      {/* Upload step */}
      {step === "upload" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold mb-1">
              Import CSV — {account.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Upload a CSV file from your bank to import transactions.
            </p>
          </div>

          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".csv";
              input.onchange = (e) => {
                const f = (e.target as HTMLInputElement).files?.[0];
                if (f) handleFileSelect(f);
              };
              input.click();
            }}
          >
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">
              Drop a CSV file here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports standard bank CSV exports
            </p>
          </div>

          {onSkip && (
            <Button variant="ghost" size="sm" className="w-full" onClick={onSkip}>
              Skip import
            </Button>
          )}
        </div>
      )}

      {/* Map columns step */}
      {step === "map" && (
        <CsvColumnMapper
          headers={headers}
          sampleRows={rawRows.slice(0, 5)}
          initialMapping={savedMapping ?? undefined}
          onConfirm={handleMappingConfirm}
          onBack={() => setStep("upload")}
        />
      )}

      {/* Preview step */}
      {step === "preview" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold mb-1">Review Import</h3>
            <p className="text-sm text-muted-foreground">
              {file?.name} — {parsedRows.length} rows parsed
            </p>
          </div>

          <CsvPreviewTable
            rows={parsedRows}
            currency={account.currency}
            selectedRows={selectedRows}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            defaultCategoryId={defaultCategoryId}
            onCategoryChange={setDefaultCategoryId}
            categories={categories}
          />

          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setStep("map")}
              disabled={importing}
            >
              Back
            </Button>
            <Button
              className="flex-1"
              onClick={handleImport}
              disabled={importing || selectedRows.size === 0 || !defaultCategoryId}
            >
              {importing ? (
                <>
                  <Spinner size="sm" />
                  Importing...
                </>
              ) : (
                `Import ${selectedRows.size} Transactions`
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Results step */}
      {step === "results" && result && (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
              result.errors.length === 0 ? "bg-success/10" : "bg-warning/10"
            }`}>
              {result.errors.length === 0 ? (
                <Check className="h-7 w-7 text-success" />
              ) : (
                <AlertCircle className="h-7 w-7 text-warning" />
              )}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold">Import Complete</h3>
            <p className="text-sm text-muted-foreground mt-1">{account.name}</p>
          </div>

          <div className="flex flex-col border rounded-lg shadow-sm w-full divide-y">
            <Card className="border-0 shadow-none rounded-none">
              <CardContent className="px-4 py-3">
                <div className="text-xs text-muted-foreground">Imported</div>
                <div className="text-2xl font-bold text-success">{result.imported}</div>
              </CardContent>
            </Card>
            {result.skippedDuplicates > 0 && (
              <Card className="border-0 shadow-none rounded-none">
                <CardContent className="px-4 py-3">
                  <div className="text-xs text-muted-foreground">Skipped (duplicates)</div>
                  <div className="text-2xl font-bold text-warning">{result.skippedDuplicates}</div>
                </CardContent>
              </Card>
            )}
            {result.errors.length > 0 && (
              <Card className="border-0 shadow-none rounded-none">
                <CardContent className="px-4 py-3">
                  <div className="text-xs text-muted-foreground">Errors</div>
                  <div className="text-2xl font-bold text-destructive">{result.errors.length}</div>
                </CardContent>
              </Card>
            )}
          </div>

          {result.errors.length > 0 && (
            <Accordion type="single" collapsible className="bg-destructive/5 border border-destructive/20 rounded-lg">
              <AccordionItem value="errors" className="border-b-0">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium text-destructive hover:no-underline">
                  {result.errors.length} error{result.errors.length !== 1 ? "s" : ""}
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <ul className="list-disc list-inside text-xs text-destructive space-y-1">
                    {result.errors.slice(0, 20).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                    {result.errors.length > 20 && (
                      <li>...and {result.errors.length - 20} more</li>
                    )}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      )}
    </div>
  );
}
