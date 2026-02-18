import { describe, it, expect } from "vitest";
import {
  createExpenseEntries,
  createIncomeEntries,
  createTransferEntries,
  createOpeningBalanceEntries,
  validateBalancedEntries,
} from "@/lib/accounting";

describe("createExpenseEntries", () => {
  it("creates balanced entries for same-currency expense", () => {
    const entries = createExpenseEntries({
      categoryId: "cat-groceries",
      accountId: "acc-checking",
      amountCents: 5000, // S$50.00
      currency: "SGD",
      baseCurrency: "SGD",
    });

    expect(entries).toHaveLength(2);

    // Category entry (debit: expense increases)
    expect(entries[0].category_id).toBe("cat-groceries");
    expect(entries[0].amount).toBe(5000);
    expect(entries[0].base_amount).toBe(5000);

    // Account entry (credit: balance decreases)
    expect(entries[1].account_id).toBe("acc-checking");
    expect(entries[1].amount).toBe(-5000);
    expect(entries[1].base_amount).toBe(-5000);

    // Must sum to zero
    const sum = entries.reduce((s, e) => s + e.base_amount, 0);
    expect(sum).toBe(0);
  });

  it("creates balanced entries for cross-currency expense", () => {
    // JPY expense paid from SGD card
    const entries = createExpenseEntries({
      categoryId: "cat-dining",
      accountId: "acc-sgd-card",
      amountCents: 3000, // ¥3,000 (JPY has 0 decimal places, but we store as-is)
      currency: "JPY",
      baseCurrency: "SGD",
      exchangeRate: 0.01, // 1 JPY = 0.01 SGD
    });

    expect(entries).toHaveLength(2);
    expect(entries[0].currency).toBe("JPY");
    expect(entries[0].amount).toBe(3000);

    // Base amounts should sum to zero
    const sum = entries.reduce((s, e) => s + e.base_amount, 0);
    expect(sum).toBe(0);

    // Exchange rate should be set
    expect(entries[0].exchange_rate).toBe(0.01);
  });
});

describe("createIncomeEntries", () => {
  it("creates balanced entries for same-currency income", () => {
    const entries = createIncomeEntries({
      categoryId: "cat-salary",
      accountId: "acc-checking",
      amountCents: 800000, // S$8,000.00
      currency: "SGD",
      baseCurrency: "SGD",
    });

    expect(entries).toHaveLength(2);

    // Account entry (debit: balance increases)
    expect(entries[0].account_id).toBe("acc-checking");
    expect(entries[0].amount).toBe(800000);

    // Category entry (credit: income category)
    expect(entries[1].category_id).toBe("cat-salary");
    expect(entries[1].amount).toBe(-800000);

    const sum = entries.reduce((s, e) => s + e.base_amount, 0);
    expect(sum).toBe(0);
  });

  it("creates balanced entries for cross-currency income", () => {
    // USD freelance income deposited to SGD account
    const entries = createIncomeEntries({
      categoryId: "cat-freelance",
      accountId: "acc-sgd-savings",
      amountCents: 100000, // $1,000.00
      currency: "USD",
      baseCurrency: "SGD",
      exchangeRate: 1.35, // 1 USD = 1.35 SGD
    });

    expect(entries).toHaveLength(2);
    const sum = entries.reduce((s, e) => s + e.base_amount, 0);
    expect(sum).toBe(0);
  });
});

describe("createTransferEntries", () => {
  it("creates balanced entries for same-currency transfer", () => {
    const entries = createTransferEntries({
      fromAccountId: "acc-checking",
      toAccountId: "acc-savings",
      amountCents: 100000, // S$1,000.00
      fromCurrency: "SGD",
      toCurrency: "SGD",
      baseCurrency: "SGD",
    });

    expect(entries).toHaveLength(2);

    // To account (debit: balance increases)
    expect(entries[0].account_id).toBe("acc-savings");
    expect(entries[0].amount).toBe(100000);

    // From account (credit: balance decreases)
    expect(entries[1].account_id).toBe("acc-checking");
    expect(entries[1].amount).toBe(-100000);

    const sum = entries.reduce((s, e) => s + e.base_amount, 0);
    expect(sum).toBe(0);
  });

  it("creates balanced entries for cross-currency transfer", () => {
    // Transfer from SGD checking to USD Wise account
    const entries = createTransferEntries({
      fromAccountId: "acc-sgd-checking",
      toAccountId: "acc-usd-wise",
      amountCents: 135000, // S$1,350.00
      fromCurrency: "SGD",
      toCurrency: "USD",
      baseCurrency: "SGD",
      exchangeRate: 0.74, // 1 SGD = 0.74 USD
    });

    expect(entries).toHaveLength(2);
    const sum = entries.reduce((s, e) => s + e.base_amount, 0);
    expect(sum).toBe(0);
  });
});

describe("createOpeningBalanceEntries", () => {
  it("creates balanced entries for opening balance", () => {
    const entries = createOpeningBalanceEntries({
      accountId: "acc-checking",
      equityAccountId: "acc-equity",
      amountCents: 500000, // S$5,000.00
      currency: "SGD",
      baseCurrency: "SGD",
    });

    expect(entries).toHaveLength(2);

    // Account gets the balance
    expect(entries[0].account_id).toBe("acc-checking");
    expect(entries[0].amount).toBe(500000);

    // Equity absorbs the offset
    expect(entries[1].account_id).toBe("acc-equity");
    expect(entries[1].amount).toBe(-500000);

    const sum = entries.reduce((s, e) => s + e.base_amount, 0);
    expect(sum).toBe(0);
  });

  it("handles negative opening balance (for liabilities)", () => {
    const entries = createOpeningBalanceEntries({
      accountId: "acc-credit-card",
      equityAccountId: "acc-equity",
      amountCents: -200000, // -S$2,000 (owe money)
      currency: "SGD",
      baseCurrency: "SGD",
    });

    expect(entries[0].amount).toBe(-200000);
    expect(entries[1].amount).toBe(200000);

    const sum = entries.reduce((s, e) => s + e.base_amount, 0);
    expect(sum).toBe(0);
  });
});

describe("validateBalancedEntries", () => {
  it("returns valid for balanced entries", () => {
    const result = validateBalancedEntries([
      { account_id: "a", amount: 100, currency: "SGD", base_amount: 100 },
      { category_id: "c", amount: -100, currency: "SGD", base_amount: -100 },
    ]);
    expect(result.valid).toBe(true);
    expect(result.sum).toBe(0);
  });

  it("returns invalid for imbalanced entries", () => {
    const result = validateBalancedEntries([
      { account_id: "a", amount: 100, currency: "SGD", base_amount: 100 },
      { category_id: "c", amount: -50, currency: "SGD", base_amount: -50 },
    ]);
    expect(result.valid).toBe(false);
    expect(result.sum).toBe(50);
  });

  it("returns invalid for less than 2 entries", () => {
    const result = validateBalancedEntries([
      { account_id: "a", amount: 100, currency: "SGD", base_amount: 100 },
    ]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("at least 2");
  });

  it("returns invalid when entry has both account and category", () => {
    const result = validateBalancedEntries([
      { account_id: "a", category_id: "c", amount: 100, currency: "SGD", base_amount: 100 },
      { account_id: "b", amount: -100, currency: "SGD", base_amount: -100 },
    ]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("exactly one");
  });

  it("returns invalid when entry has neither account nor category", () => {
    const result = validateBalancedEntries([
      { amount: 100, currency: "SGD", base_amount: 100 },
      { account_id: "b", amount: -100, currency: "SGD", base_amount: -100 },
    ]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("exactly one");
  });
});
