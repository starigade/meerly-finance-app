import { describe, it, expect } from "vitest";
import {
  dollarsToCents,
  centsToDollars,
  formatMoney,
  formatAmount,
  convertAmount,
  getCurrencyConfig,
  getCurrencySymbol,
  getCurrencyDecimals,
} from "@/lib/currency";

describe("dollarsToCents", () => {
  it("converts whole dollars to cents", () => {
    expect(dollarsToCents("50", "SGD")).toBe(5000);
    expect(dollarsToCents("100", "USD")).toBe(10000);
  });

  it("converts decimal amounts to cents", () => {
    expect(dollarsToCents("50.99", "SGD")).toBe(5099);
    expect(dollarsToCents("0.01", "SGD")).toBe(1);
  });

  it("rounds correctly for currencies with different decimal places", () => {
    // JPY has 0 decimal places
    expect(dollarsToCents("3000", "JPY")).toBe(3000);
    expect(dollarsToCents("3000.5", "JPY")).toBe(3001); // rounds
  });

  it("handles zero", () => {
    expect(dollarsToCents("0", "SGD")).toBe(0);
    expect(dollarsToCents(0, "SGD")).toBe(0);
  });

  it("handles empty/invalid input", () => {
    expect(dollarsToCents("", "SGD")).toBe(0);
    expect(dollarsToCents("abc", "SGD")).toBe(0);
  });

  it("handles number input", () => {
    expect(dollarsToCents(50.99, "SGD")).toBe(5099);
  });

  it("avoids floating point errors", () => {
    // Classic floating point: 0.1 + 0.2 = 0.30000000000000004
    // dollarsToCents should round correctly
    expect(dollarsToCents("19.99", "SGD")).toBe(1999);
    expect(dollarsToCents("9.99", "SGD")).toBe(999);
  });
});

describe("centsToDollars", () => {
  it("converts cents to dollars", () => {
    expect(centsToDollars(5000, "SGD")).toBe(50);
    expect(centsToDollars(5099, "SGD")).toBe(50.99);
  });

  it("handles JPY (0 decimal places)", () => {
    expect(centsToDollars(3000, "JPY")).toBe(3000);
  });

  it("handles zero", () => {
    expect(centsToDollars(0, "SGD")).toBe(0);
  });
});

describe("formatMoney", () => {
  it("formats SGD correctly", () => {
    expect(formatMoney(5000, "SGD")).toBe("S$50.00");
    expect(formatMoney(123456, "SGD")).toBe("S$1,234.56");
  });

  it("formats JPY correctly (no decimals)", () => {
    expect(formatMoney(3000, "JPY")).toBe("¥3,000");
  });

  it("formats negative amounts", () => {
    expect(formatMoney(-5000, "SGD")).toBe("-S$50.00");
  });

  it("formats with sign option", () => {
    expect(formatMoney(5000, "SGD", { showSign: true })).toBe("+S$50.00");
    expect(formatMoney(-5000, "SGD", { showSign: true })).toBe("-S$50.00");
    expect(formatMoney(0, "SGD", { showSign: true })).toBe("S$0.00");
  });

  it("formats compact amounts", () => {
    expect(formatMoney(100000000, "SGD", { compact: true })).toBe("S$1.0M");
    expect(formatMoney(150000, "SGD", { compact: true })).toBe("S$1.5K");
  });

  it("formats USD", () => {
    expect(formatMoney(10000, "USD")).toBe("$100.00");
  });

  it("formats MYR", () => {
    expect(formatMoney(10050, "MYR")).toBe("RM100.50");
  });
});

describe("formatAmount", () => {
  it("formats without currency symbol", () => {
    expect(formatAmount(5000, "SGD")).toBe("50.00");
    expect(formatAmount(-5000, "SGD")).toBe("50.00"); // always positive
  });
});

describe("convertAmount", () => {
  it("returns same amount for same currency", () => {
    expect(convertAmount(5000, "SGD", "SGD", 1)).toBe(5000);
  });

  it("converts SGD to USD", () => {
    // S$100 at rate 0.74 = $74
    const result = convertAmount(10000, "SGD", "USD", 0.74);
    expect(result).toBe(7400);
  });

  it("converts JPY to SGD", () => {
    // ¥3000 at rate 0.01 = S$30
    // JPY: 0 decimals, SGD: 2 decimals
    const result = convertAmount(3000, "JPY", "SGD", 0.01);
    expect(result).toBe(3000); // 3000 JPY cents * 0.01 * 100 SGD cents
  });

  it("handles precise decimal rates", () => {
    // S$1350 (135000 cents) at rate 0.74 to USD
    const result = convertAmount(135000, "SGD", "USD", 0.74);
    expect(result).toBe(99900); // $999.00
  });
});

describe("getCurrencyConfig", () => {
  it("returns config for known currencies", () => {
    const sgd = getCurrencyConfig("SGD");
    expect(sgd.symbol).toBe("S$");
    expect(sgd.decimals).toBe(2);

    const jpy = getCurrencyConfig("JPY");
    expect(jpy.symbol).toBe("¥");
    expect(jpy.decimals).toBe(0);
  });

  it("returns fallback for unknown currencies", () => {
    const unknown = getCurrencyConfig("XYZ");
    expect(unknown.symbol).toBe("XYZ");
    expect(unknown.decimals).toBe(2);
  });
});

describe("getCurrencySymbol", () => {
  it("returns correct symbols", () => {
    expect(getCurrencySymbol("SGD")).toBe("S$");
    expect(getCurrencySymbol("USD")).toBe("$");
    expect(getCurrencySymbol("EUR")).toBe("€");
    expect(getCurrencySymbol("GBP")).toBe("£");
    expect(getCurrencySymbol("JPY")).toBe("¥");
    expect(getCurrencySymbol("MYR")).toBe("RM");
  });
});

describe("getCurrencyDecimals", () => {
  it("returns correct decimal places", () => {
    expect(getCurrencyDecimals("SGD")).toBe(2);
    expect(getCurrencyDecimals("USD")).toBe(2);
    expect(getCurrencyDecimals("JPY")).toBe(0);
    expect(getCurrencyDecimals("KRW")).toBe(0);
    expect(getCurrencyDecimals("VND")).toBe(0);
  });
});
