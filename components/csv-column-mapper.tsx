"use client";

import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectGroup, SelectSeparator } from "@/components/ui/select";
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
      const date = row[dateColumn] ?? "—";
      const desc = row[descriptionColumn] ?? "—";
      let amount = "—";
      if (mode === "single" && amountColumn) {
        const val = parseAmountValue(row[amountColumn] ?? "");
        amount = val !== null ? val.toFixed(2) : "—";
      } else if (mode === "separate") {
        const d = parseAmountValue(row[debitColumn] ?? "");
        const c = parseAmountValue(row[creditColumn] ?? "");
        if (d !== null && d !== 0) amount = (-Math.abs(d)).toFixed(2);
        else if (c !== null && c !== 0) amount = Math.abs(c).toFixed(2);
      }
      if (invertSign && amount !== "—") {
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
        <p className="text-sm text-neutral">
          Tell us which CSV columns contain the date, description, and amount.
        </p>
      </div>

      {/* Date column */}
      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-sm font-medium">Date Column</span>
        </label>
        <Select value={dateColumn} onValueChange={setDateColumn}>
          <SelectTrigger className="select-sm h-9 text-sm">
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
      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-sm font-medium">Date Format</span>
          {detectedDateFormat && (
            <span className="label-text-alt text-xs text-success">Auto-detected</span>
          )}
        </label>
        <Select value={effectiveDateFormat} onValueChange={setDateFormat}>
          <SelectTrigger className="select-sm h-9 text-sm">
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
      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-sm font-medium">Description Column</span>
        </label>
        <Select value={descriptionColumn} onValueChange={setDescriptionColumn}>
          <SelectTrigger className="select-sm h-9 text-sm">
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
      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-sm font-medium">Amount Format</span>
        </label>
        <div className="flex gap-2">
          <button
            className={`btn btn-sm flex-1 ${mode === "single" ? "btn-primary" : "btn-ghost border-base-300"}`}
            onClick={() => setMode("single")}
          >
            Single column
          </button>
          <button
            className={`btn btn-sm flex-1 ${mode === "separate" ? "btn-primary" : "btn-ghost border-base-300"}`}
            onClick={() => setMode("separate")}
          >
            Debit / Credit
          </button>
        </div>
      </div>

      {/* Amount columns */}
      {mode === "single" ? (
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text text-sm font-medium">Amount Column</span>
          </label>
          <Select value={amountColumn} onValueChange={setAmountColumn}>
            <SelectTrigger className="select-sm h-9 text-sm">
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
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-sm font-medium">Debit Column</span>
            </label>
            <Select value={debitColumn} onValueChange={setDebitColumn}>
              <SelectTrigger className="select-sm h-9 text-sm">
                <SelectValue placeholder="Debit" />
              </SelectTrigger>
              <SelectContent>
                {headers.map((h) => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-sm font-medium">Credit Column</span>
            </label>
            <Select value={creditColumn} onValueChange={setCreditColumn}>
              <SelectTrigger className="select-sm h-9 text-sm">
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
      <label className="label cursor-pointer justify-start gap-3">
        <input
          type="checkbox"
          className="checkbox checkbox-sm checkbox-primary"
          checked={invertSign}
          onChange={(e) => setInvertSign(e.target.checked)}
        />
        <span className="label-text text-sm">
          Invert sign (if your bank uses positive for expenses)
        </span>
      </label>

      {/* Live preview */}
      {previewRows.length > 0 && (
        <div>
          <p className="text-xs font-medium text-neutral mb-2 uppercase tracking-wider">Preview</p>
          <div className="overflow-x-auto">
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs">{row.date}</td>
                    <td className="text-xs max-w-[200px] truncate">{row.desc}</td>
                    <td className={`text-right font-mono text-xs ${
                      row.amount !== "—" && parseFloat(row.amount) < 0 ? "text-error" : "text-success"
                    }`}>
                      {row.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button className="btn btn-ghost flex-1" onClick={onBack}>
          Back
        </button>
        <button
          className="btn btn-primary flex-1"
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
        </button>
      </div>
    </div>
  );
}
