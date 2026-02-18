import Papa from "papaparse";
import { parse as parseDate, isValid, format } from "date-fns";
import {
  CSV_DATE_COLUMN_PATTERNS,
  CSV_DESCRIPTION_COLUMN_PATTERNS,
  CSV_AMOUNT_COLUMN_PATTERNS,
  CSV_DEBIT_COLUMN_PATTERNS,
  CSV_CREDIT_COLUMN_PATTERNS,
  CSV_DATE_FORMATS,
} from "./constants";
import { dollarsToCents } from "./currency";
import type { CsvColumnMapping, CsvParsedRow } from "./types";

// ============================================================
// Parse CSV file
// ============================================================

export interface CsvParseResult {
  headers: string[];
  rows: Record<string, string>[];
}

export function parseCsvFile(file: File): Promise<CsvParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const headers = results.meta.fields ?? [];
        const rows = results.data as Record<string, string>[];
        resolve({ headers, rows });
      },
      error: (error) => reject(new Error(error.message)),
    });
  });
}

// ============================================================
// Auto-detect column mapping
// ============================================================

function matchColumn(headers: string[], patterns: string[]): string | undefined {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const pattern of patterns) {
    const idx = lower.indexOf(pattern);
    if (idx !== -1) return headers[idx];
  }
  // Partial match fallback
  for (const pattern of patterns) {
    const idx = lower.findIndex((h) => h.includes(pattern));
    if (idx !== -1) return headers[idx];
  }
  return undefined;
}

export function autoDetectMapping(headers: string[]): Partial<CsvColumnMapping> {
  const dateColumn = matchColumn(headers, CSV_DATE_COLUMN_PATTERNS);
  const descriptionColumn = matchColumn(headers, CSV_DESCRIPTION_COLUMN_PATTERNS);
  const amountColumn = matchColumn(headers, CSV_AMOUNT_COLUMN_PATTERNS);
  const debitColumn = matchColumn(headers, CSV_DEBIT_COLUMN_PATTERNS);
  const creditColumn = matchColumn(headers, CSV_CREDIT_COLUMN_PATTERNS);

  // Prefer separate debit/credit if both are found
  const hasSeparate = debitColumn && creditColumn;

  return {
    dateColumn,
    descriptionColumn,
    mode: hasSeparate ? "separate" : "single",
    amountColumn: hasSeparate ? undefined : amountColumn,
    debitColumn: hasSeparate ? debitColumn : undefined,
    creditColumn: hasSeparate ? creditColumn : undefined,
  };
}

// ============================================================
// Detect date format from sample values
// ============================================================

export function detectDateFormat(samples: string[]): string | undefined {
  const nonEmpty = samples.filter((s) => s?.trim());
  if (nonEmpty.length === 0) return undefined;

  for (const { value: fmt } of CSV_DATE_FORMATS) {
    const allValid = nonEmpty.every((s) => {
      const parsed = parseDate(s.trim(), fmt, new Date());
      return isValid(parsed);
    });
    if (allValid) return fmt;
  }
  return undefined;
}

// ============================================================
// Parse amount values (handles currency symbols, commas, parenthetical negatives)
// ============================================================

export function parseAmountValue(value: string): number | null {
  if (!value || !value.trim()) return null;
  let cleaned = value.trim();

  // Handle parenthetical negatives: (500.00) → -500.00
  const isParenNeg = cleaned.startsWith("(") && cleaned.endsWith(")");
  if (isParenNeg) cleaned = cleaned.slice(1, -1);

  // Strip currency symbols and whitespace
  cleaned = cleaned.replace(/[^0-9.,\-+]/g, "");

  // Handle European format: 1.234,56 → 1234.56
  if (cleaned.includes(",") && cleaned.includes(".")) {
    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    if (lastComma > lastDot) {
      // European: dot is thousands, comma is decimal
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      // US: comma is thousands, dot is decimal
      cleaned = cleaned.replace(/,/g, "");
    }
  } else if (cleaned.includes(",")) {
    // Could be decimal separator (European) or thousands separator
    // If exactly 2 digits after comma, treat as decimal
    const parts = cleaned.split(",");
    if (parts.length === 2 && parts[1].length <= 2) {
      cleaned = cleaned.replace(",", ".");
    } else {
      cleaned = cleaned.replace(/,/g, "");
    }
  }

  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return isParenNeg ? -num : num;
}

// ============================================================
// Compute import hash (SHA-256 via Web Crypto)
// ============================================================

export async function computeImportHash(
  date: string,
  amountCents: number,
  description: string
): Promise<string> {
  const input = `${date}|${amountCents}|${description.toLowerCase().trim()}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ============================================================
// Apply mapping to raw rows
// ============================================================

export async function applyMapping(
  rows: Record<string, string>[],
  mapping: CsvColumnMapping,
  currency: string
): Promise<CsvParsedRow[]> {
  const results: CsvParsedRow[] = [];

  for (const row of rows) {
    // Parse date
    const rawDate = row[mapping.dateColumn]?.trim();
    if (!rawDate) continue;

    const parsedDate = parseDate(rawDate, mapping.dateFormat, new Date());
    if (!isValid(parsedDate)) continue;
    const date = format(parsedDate, "yyyy-MM-dd");

    // Parse description
    const description = row[mapping.descriptionColumn]?.trim() ?? "";

    // Parse amount
    let amountDollars: number;
    if (mapping.mode === "separate") {
      const debit = parseAmountValue(row[mapping.debitColumn ?? ""] ?? "");
      const credit = parseAmountValue(row[mapping.creditColumn ?? ""] ?? "");
      // Debit = money out (negative), Credit = money in (positive)
      if (debit !== null && debit !== 0) {
        amountDollars = -Math.abs(debit);
      } else if (credit !== null && credit !== 0) {
        amountDollars = Math.abs(credit);
      } else {
        continue; // No amount in either column
      }
    } else {
      const amount = parseAmountValue(row[mapping.amountColumn ?? ""] ?? "");
      if (amount === null) continue;
      amountDollars = amount;
    }

    if (mapping.invertSign) {
      amountDollars = -amountDollars;
    }

    const amountCents = dollarsToCents(amountDollars, currency);
    const importHash = await computeImportHash(date, amountCents, description);

    results.push({
      date,
      description,
      amountCents,
      importHash,
      originalRow: row,
    });
  }

  return results;
}
