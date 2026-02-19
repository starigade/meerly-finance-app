"use client";

import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectGroup, SelectSeparator } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CSV_DATE_FORMATS } from "@/lib/constants";
import { autoDetectMapping, detectDateFormat, parseAmountValue } from "@/lib/csv-parser";
import type { CsvColumnMapping } from "@/lib/types";

interface CsvColumnMapperProps {
  headers: string[];
  sampleRows: Record<string, string>[];
  initialMapping?: Partial<CsvColumnMapping>;
  onConfirm: (mapping: CsvColumnMapping) => void;
  onBack: () => void;
}

export function CsvColumnMapper({
  headers,
  sampleRows,
  initialMapping,
  onConfirm,
  onBack,
}: CsvColumnMapperProps) {
  const autoDetected = useMemo(() => autoDetectMapping(headers), [headers]);
  const init = initialMapping ?? autoDetected;

  const [dateColumn, setDateColumn] = useState(init.dateColumn ?? "");
  const [descriptionColumn, setDescriptionColumn] = useState(init.descriptionColumn ?? "");
  const [mode, setMode] = useState<"single" | "separate">(init.mode ?? "single");
  const [amountColumn, setAmountColumn] = useState(init.amountColumn ?? "");
  const [debitColumn, setDebitColumn] = useState(init.debitColumn ?? "");
  const [creditColumn, setCreditColumn] = useState(init.creditColumn ?? "");
  const [invertSign, setInvertSign] = useState(init.invertSign ?? false);

  // Auto-detect date format from samples
  const detectedDateFormat = useMemo(() => {
    if (!dateColumn || sampleRows.length === 0) return undefined;
    const samples = sampleRows.map((r) => r[dateColumn]).filter(Boolean);
    return detectDateFormat(samples);
  }, [dateColumn, sampleRows]);

  const [dateFormat, setDateFormat] = useState(
    init.dateFormat ?? detectedDateFormat ?? "yyyy-MM-dd"
  );

  // Update date format when auto-detection changes
  const effectiveDateFormat = dateFormat || detectedDateFormat || "yyyy-MM-dd";

  const canConfirm =
    dateColumn &&
    descriptionColumn &&
    (mode === "single" ? amountColumn : debitColumn && creditColumn);

  // Live preview of how the mapping interprets sample rows
  const previewRows = useMemo(() => {
    return sampleRows.slice(0, 3).map((row) => {
      const date = row[dateColumn] ?? "\u2014";
      const desc = row[descriptionColumn] ?? "\u2014";
      let amount = "\u2014";
      if (mode === "single" && amountColumn) {
        const val = parseAmountValue(row[amountColumn] ?? "");
        amount = val !== null ? val.toFixed(2) : "\u2014";
      } else if (mode === "separate") {
        const d = parseAmountValue(row[debitColumn] ?? "");
        const c = parseAmountValue(row[creditColumn] ?? "");
        if (d !== null && d !== 0) amount = (-Math.abs(d)).toFixed(2);
        else if (c !== null && c !== 0) amount = Math.abs(c).toFixed(2);
      }
      if (invertSign && amount !== "\u2014") {
        const n = parseFloat(amount);
        amount = (-n).toFixed(2);
      }
      return { date, desc, amount };
    });
  }, [dateColumn, descriptionColumn, mode, amountColumn, debitColumn, creditColumn, invertSign, sampleRows]);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold mb-1">Map Your Columns</h3>
        <p className="text-sm text-muted-foreground">
          Tell us which CSV columns contain the date, description, and amount.
        </p>
      </div>

      {/* Date column */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Date Column</Label>
        <Select value={dateColumn} onValueChange={setDateColumn}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select date column" />
          </SelectTrigger>
          <SelectContent>
            {headers.map((h) => (
              <SelectItem key={h} value={h}>{h}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date format */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Date Format</Label>
          {detectedDateFormat && (
            <span className="text-xs text-success">Auto-detected</span>
          )}
        </div>
        <Select value={effectiveDateFormat} onValueChange={setDateFormat}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CSV_DATE_FORMATS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.value} ({f.example})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description column */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Description Column</Label>
        <Select value={descriptionColumn} onValueChange={setDescriptionColumn}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select description column" />
          </SelectTrigger>
          <SelectContent>
            {headers.map((h) => (
              <SelectItem key={h} value={h}>{h}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Amount mode toggle */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Amount Format</Label>
        <div className="flex gap-2">
          <Button
            variant={mode === "single" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setMode("single")}
          >
            Single column
          </Button>
          <Button
            variant={mode === "separate" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setMode("separate")}
          >
            Debit / Credit
          </Button>
        </div>
      </div>

      {/* Amount columns */}
      {mode === "single" ? (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Amount Column</Label>
          <Select value={amountColumn} onValueChange={setAmountColumn}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select amount column" />
            </SelectTrigger>
            <SelectContent>
              {headers.map((h) => (
                <SelectItem key={h} value={h}>{h}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Debit Column</Label>
            <Select value={debitColumn} onValueChange={setDebitColumn}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Debit" />
              </SelectTrigger>
              <SelectContent>
                {headers.map((h) => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Credit Column</Label>
            <Select value={creditColumn} onValueChange={setCreditColumn}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Credit" />
              </SelectTrigger>
              <SelectContent>
                {headers.map((h) => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Invert sign */}
      <div className="flex items-center gap-3">
        <Checkbox
          id="invert-sign"
          checked={invertSign}
          onCheckedChange={(checked) => setInvertSign(checked === true)}
        />
        <label htmlFor="invert-sign" className="text-sm cursor-pointer">
          Invert sign (if your bank uses positive for expenses)
        </label>
      </div>

      {/* Live preview */}
      {previewRows.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Preview</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-8 text-xs">Date</TableHead>
                <TableHead className="h-8 text-xs">Description</TableHead>
                <TableHead className="h-8 text-xs text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewRows.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs py-1.5">{row.date}</TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate py-1.5">{row.desc}</TableCell>
                  <TableCell className={`text-right font-mono text-xs py-1.5 ${
                    row.amount !== "\u2014" && parseFloat(row.amount) < 0 ? "text-destructive" : "text-success"
                  }`}>
                    {row.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="ghost" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button
          className="flex-1"
          disabled={!canConfirm}
          onClick={() =>
            onConfirm({
              dateColumn,
              descriptionColumn,
              mode,
              amountColumn: mode === "single" ? amountColumn : undefined,
              debitColumn: mode === "separate" ? debitColumn : undefined,
              creditColumn: mode === "separate" ? creditColumn : undefined,
              dateFormat: effectiveDateFormat,
              invertSign,
            })
          }
        >
          Preview Data
        </Button>
      </div>
    </div>
  );
}
