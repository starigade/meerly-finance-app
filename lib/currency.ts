import { COMMON_CURRENCIES, DEFAULT_CURRENCY } from "./constants";

// ============================================================
// Currency metadata lookup
// ============================================================

const currencyMap = new Map<string, (typeof COMMON_CURRENCIES)[number]>(
  COMMON_CURRENCIES.map((c) => [c.code, c])
);

export function getCurrencyConfig(code: string) {
  return currencyMap.get(code) ?? { code, symbol: code, name: code, decimals: 2 };
}

export function getCurrencySymbol(code: string): string {
  return getCurrencyConfig(code).symbol;
}

export function getCurrencyDecimals(code: string): number {
  return getCurrencyConfig(code).decimals;
}

// ============================================================
// Cents ↔ Dollars conversion
// ============================================================

/** Convert a user-entered dollar string to integer cents */
export function dollarsToCents(dollars: string | number, currencyCode: string = DEFAULT_CURRENCY): number {
  const value = typeof dollars === "string" ? parseFloat(dollars) : dollars;
  if (isNaN(value)) return 0;
  const decimals = getCurrencyDecimals(currencyCode);
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier);
}

/** Convert integer cents to a dollar number (for calculations, not display) */
export function centsToDollars(cents: number, currencyCode: string = DEFAULT_CURRENCY): number {
  const decimals = getCurrencyDecimals(currencyCode);
  const divisor = Math.pow(10, decimals);
  return cents / divisor;
}

// ============================================================
// Formatting for display
// ============================================================

/** Format cents as a full currency string: S$1,234.56 */
export function formatMoney(
  cents: number,
  currencyCode: string = DEFAULT_CURRENCY,
  options?: { showSign?: boolean; compact?: boolean }
): string {
  const config = getCurrencyConfig(currencyCode);
  const dollars = centsToDollars(cents, currencyCode);
  const abs = Math.abs(dollars);

  let formatted: string;
  if (options?.compact && abs >= 1000) {
    if (abs >= 1_000_000) {
      formatted = `${(abs / 1_000_000).toFixed(1)}M`;
    } else {
      formatted = `${(abs / 1000).toFixed(1)}K`;
    }
  } else {
    formatted = abs.toLocaleString("en-US", {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    });
  }

  const sign = options?.showSign
    ? cents > 0
      ? "+"
      : cents < 0
        ? "-"
        : ""
    : cents < 0
      ? "-"
      : "";

  return `${sign}${config.symbol}${formatted}`;
}

/** Format just the number without currency symbol */
export function formatAmount(cents: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const config = getCurrencyConfig(currencyCode);
  const dollars = Math.abs(centsToDollars(cents, currencyCode));
  return dollars.toLocaleString("en-US", {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  });
}

// ============================================================
// Exchange rate helpers
// ============================================================

/** Convert an amount from one currency to another using a rate */
export function convertAmount(
  amountCents: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) return amountCents;
  // Convert cents → dollars → convert → cents
  const fromDecimals = getCurrencyDecimals(fromCurrency);
  const toDecimals = getCurrencyDecimals(toCurrency);
  const fromDollars = amountCents / Math.pow(10, fromDecimals);
  const toDollars = fromDollars * exchangeRate;
  return Math.round(toDollars * Math.pow(10, toDecimals));
}
