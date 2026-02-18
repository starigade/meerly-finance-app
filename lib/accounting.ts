import type { TransactionUIType } from "./types";
import { convertAmount } from "./currency";

// ============================================================
// Double-entry helpers
// ============================================================

export interface EntryInput {
  account_id?: string;
  category_id?: string;
  amount: number; // cents in native currency (positive = debit, negative = credit)
  currency: string;
  base_amount: number; // cents in household base currency
  exchange_rate?: number;
}

/**
 * Create a balanced set of entries for an expense transaction.
 * - Debits expense category (positive in P&L = expense increases)
 * - Credits payment account (negative = balance decreases)
 */
export function createExpenseEntries(params: {
  categoryId: string;
  accountId: string;
  amountCents: number;
  currency: string;
  baseCurrency: string;
  exchangeRate?: number;
}): EntryInput[] {
  const { categoryId, accountId, amountCents, currency, baseCurrency, exchangeRate } = params;
  const rate = exchangeRate ?? 1;
  const baseAmount = currency === baseCurrency ? amountCents : convertAmount(amountCents, currency, baseCurrency, rate);

  return [
    {
      category_id: categoryId,
      amount: amountCents, // positive: expense category "receives"
      currency,
      base_amount: baseAmount,
      exchange_rate: currency === baseCurrency ? undefined : rate,
    },
    {
      account_id: accountId,
      amount: -amountCents, // negative: account balance decreases
      currency,
      base_amount: -baseAmount,
      exchange_rate: currency === baseCurrency ? undefined : rate,
    },
  ];
}

/**
 * Create a balanced set of entries for an income transaction.
 * - Credits income category (negative in P&L = income increases)
 * - Debits destination account (positive = balance increases)
 */
export function createIncomeEntries(params: {
  categoryId: string;
  accountId: string;
  amountCents: number;
  currency: string;
  baseCurrency: string;
  exchangeRate?: number;
}): EntryInput[] {
  const { categoryId, accountId, amountCents, currency, baseCurrency, exchangeRate } = params;
  const rate = exchangeRate ?? 1;
  const baseAmount = currency === baseCurrency ? amountCents : convertAmount(amountCents, currency, baseCurrency, rate);

  return [
    {
      account_id: accountId,
      amount: amountCents, // positive: account balance increases
      currency,
      base_amount: baseAmount,
      exchange_rate: currency === baseCurrency ? undefined : rate,
    },
    {
      category_id: categoryId,
      amount: -amountCents, // negative: income category
      currency,
      base_amount: -baseAmount,
      exchange_rate: currency === baseCurrency ? undefined : rate,
    },
  ];
}

/**
 * Create a balanced set of entries for a transfer between accounts.
 * - Debits destination (positive = balance increases)
 * - Credits source (negative = balance decreases)
 */
export function createTransferEntries(params: {
  fromAccountId: string;
  toAccountId: string;
  amountCents: number;
  fromCurrency: string;
  toCurrency: string;
  baseCurrency: string;
  exchangeRate?: number;
  toAmountCents?: number;
}): EntryInput[] {
  const {
    fromAccountId,
    toAccountId,
    amountCents,
    fromCurrency,
    toCurrency,
    baseCurrency,
    exchangeRate,
    toAmountCents,
  } = params;
  const rate = exchangeRate ?? 1;

  // Source entry (money leaves this account)
  const fromBaseAmount =
    fromCurrency === baseCurrency
      ? amountCents
      : convertAmount(amountCents, fromCurrency, baseCurrency, rate);

  // Destination entry
  const toAmount = toAmountCents ?? (fromCurrency === toCurrency ? amountCents : convertAmount(amountCents, fromCurrency, toCurrency, rate));
  const toBaseAmount = fromBaseAmount; // Must match for zero-sum

  return [
    {
      account_id: toAccountId,
      amount: toAmount,
      currency: toCurrency,
      base_amount: toBaseAmount,
      exchange_rate: toCurrency === baseCurrency ? undefined : rate,
    },
    {
      account_id: fromAccountId,
      amount: -amountCents,
      currency: fromCurrency,
      base_amount: -fromBaseAmount,
      exchange_rate: fromCurrency === baseCurrency ? undefined : rate,
    },
  ];
}

/**
 * Create entries for an opening balance.
 * - Debits the account (positive for assets, negative for liabilities)
 * - Credits equity Opening Balances account
 */
export function createOpeningBalanceEntries(params: {
  accountId: string;
  equityAccountId: string;
  amountCents: number;
  currency: string;
  baseCurrency: string;
  exchangeRate?: number;
}): EntryInput[] {
  const { accountId, equityAccountId, amountCents, currency, baseCurrency, exchangeRate } = params;
  const rate = exchangeRate ?? 1;
  const baseAmount = currency === baseCurrency ? amountCents : convertAmount(amountCents, currency, baseCurrency, rate);

  return [
    {
      account_id: accountId,
      amount: amountCents,
      currency,
      base_amount: baseAmount,
      exchange_rate: currency === baseCurrency ? undefined : rate,
    },
    {
      account_id: equityAccountId,
      amount: -amountCents, // Opening Balances absorbs the offset
      currency: baseCurrency,
      base_amount: -baseAmount,
    },
  ];
}

// ============================================================
// Validation
// ============================================================

/** Validate that entries sum to zero in base currency */
export function validateBalancedEntries(entries: EntryInput[]): {
  valid: boolean;
  sum: number;
  error?: string;
} {
  if (entries.length < 2) {
    return { valid: false, sum: 0, error: "Transaction must have at least 2 entries" };
  }

  const sum = entries.reduce((acc, e) => acc + e.base_amount, 0);
  if (sum !== 0) {
    return { valid: false, sum, error: `Entries do not sum to zero (sum = ${sum})` };
  }

  // Verify each entry has exactly one target
  for (const entry of entries) {
    const hasAccount = !!entry.account_id;
    const hasCategory = !!entry.category_id;
    if (hasAccount === hasCategory) {
      return {
        valid: false,
        sum,
        error: "Each entry must have exactly one of account_id or category_id",
      };
    }
  }

  return { valid: true, sum: 0 };
}

/** Get the entry creation function for a given UI type */
export function getEntryCreator(uiType: TransactionUIType) {
  switch (uiType) {
    case "expense":
      return createExpenseEntries;
    case "income":
      return createIncomeEntries;
    case "transfer":
      return createTransferEntries;
    case "opening_balance":
      return createOpeningBalanceEntries;
    default:
      throw new Error(`Unknown transaction type: ${uiType}`);
  }
}
