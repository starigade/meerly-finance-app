import type { AccountSubType, AccountType, CategoryType } from "./types";

// ============================================================
// Account sub-type metadata
// ============================================================

export const ACCOUNT_SUB_TYPES: Record<
  AccountSubType,
  { label: string; type: AccountType; icon: string }
> = {
  checking: { label: "Checking Account", type: "asset", icon: "landmark" },
  savings: { label: "Savings Account", type: "asset", icon: "piggy-bank" },
  investment: { label: "Investment", type: "asset", icon: "trending-up" },
  property: { label: "Property", type: "asset", icon: "home" },
  cash: { label: "Cash", type: "asset", icon: "banknote" },
  other_asset: { label: "Other Asset", type: "asset", icon: "wallet" },
  credit_card: { label: "Credit Card", type: "liability", icon: "credit-card" },
  mortgage: { label: "Mortgage", type: "liability", icon: "building" },
  student_loan: { label: "Student Loan", type: "liability", icon: "graduation-cap" },
  personal_loan: { label: "Personal Loan", type: "liability", icon: "hand-coins" },
  other_liability: { label: "Other Liability", type: "liability", icon: "circle-minus" },
  opening_balances: { label: "Opening Balances", type: "equity", icon: "scale" },
};

// Group sub-types by account type for UI
export const ASSET_SUB_TYPES: AccountSubType[] = [
  "checking",
  "savings",
  "investment",
  "property",
  "cash",
  "other_asset",
];

export const LIABILITY_SUB_TYPES: AccountSubType[] = [
  "credit_card",
  "mortgage",
  "student_loan",
  "personal_loan",
  "other_liability",
];

// ============================================================
// UI terminology mapping (accounting → plain English)
// ============================================================

export const UI_LABELS = {
  asset: "What You Own",
  liability: "What You Owe",
  income: "Income",
  expense: "Spending",
  net_worth: "Net Worth",
  pnl: "Income & Spending",
  balance_sheet: "Net Worth",
} as const;

// ============================================================
// Transaction type labels
// ============================================================

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  expense: "Expense",
  income: "Income",
  transfer: "Transfer",
  debt_payment: "Debt Payment",
  opening_balance: "Opening Balance",
};

// ============================================================
// Currency config
// ============================================================

export const COMMON_CURRENCIES = [
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", decimals: 2 },
  { code: "USD", symbol: "$", name: "US Dollar", decimals: 2 },
  { code: "EUR", symbol: "€", name: "Euro", decimals: 2 },
  { code: "GBP", symbol: "£", name: "British Pound", decimals: 2 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", decimals: 0 },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", decimals: 2 },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", decimals: 2 },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", decimals: 2 },
  { code: "THB", symbol: "฿", name: "Thai Baht", decimals: 2 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", decimals: 2 },
  { code: "KRW", symbol: "₩", name: "South Korean Won", decimals: 0 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", decimals: 2 },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", decimals: 0 },
  { code: "TWD", symbol: "NT$", name: "Taiwan Dollar", decimals: 2 },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", decimals: 2 },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong", decimals: 0 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", decimals: 2 },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", decimals: 2 },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", decimals: 2 },
  { code: "AED", symbol: "AED", name: "UAE Dirham", decimals: 2 },
] as const;

export const DEFAULT_CURRENCY = "SGD";

// ============================================================
// Default categories (for seeding — mirrors SQL seed)
// ============================================================

interface DefaultCategory {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
}

export const DEFAULT_INCOME_CATEGORIES: DefaultCategory[] = [
  { name: "Salary", type: "income", icon: "briefcase", color: "#16a34a" },
  { name: "Freelance", type: "income", icon: "laptop", color: "#059669" },
  { name: "Interest", type: "income", icon: "percent", color: "#0d9488" },
  { name: "Dividends", type: "income", icon: "trending-up", color: "#0891b2" },
  { name: "Gifts Received", type: "income", icon: "gift", color: "#7c3aed" },
  { name: "Other Income", type: "income", icon: "plus-circle", color: "#6b7280" },
];

export const DEFAULT_EXPENSE_CATEGORIES: DefaultCategory[] = [
  { name: "Groceries", type: "expense", icon: "shopping-cart", color: "#dc2626" },
  { name: "Dining Out", type: "expense", icon: "utensils", color: "#ea580c" },
  { name: "Transport", type: "expense", icon: "car", color: "#d97706" },
  { name: "Rent", type: "expense", icon: "home", color: "#ca8a04" },
  { name: "Utilities", type: "expense", icon: "zap", color: "#65a30d" },
  { name: "Healthcare", type: "expense", icon: "heart", color: "#e11d48" },
  { name: "Insurance", type: "expense", icon: "shield", color: "#9333ea" },
  { name: "Shopping", type: "expense", icon: "shopping-bag", color: "#c026d3" },
  { name: "Entertainment", type: "expense", icon: "film", color: "#2563eb" },
  { name: "Education", type: "expense", icon: "book-open", color: "#4f46e5" },
  { name: "Travel", type: "expense", icon: "plane", color: "#0ea5e9" },
  { name: "Personal Care", type: "expense", icon: "smile", color: "#f472b6" },
  { name: "Subscriptions", type: "expense", icon: "repeat", color: "#7c3aed" },
  { name: "Gifts Given", type: "expense", icon: "gift", color: "#be185d" },
  { name: "Other Expense", type: "expense", icon: "more-horizontal", color: "#6b7280" },
];

// ============================================================
// Onboarding account templates
// ============================================================

export const ONBOARDING_ACCOUNT_TEMPLATES = [
  { name: "Checking Account", sub_type: "checking" as AccountSubType, icon: "landmark", description: "Your everyday spending account for bills and purchases" },
  { name: "Savings Account", sub_type: "savings" as AccountSubType, icon: "piggy-bank", description: "Money set aside for goals or emergencies" },
  { name: "Credit Card", sub_type: "credit_card" as AccountSubType, icon: "credit-card", description: "Track your credit card balance and spending" },
  { name: "Investment Account", sub_type: "investment" as AccountSubType, icon: "trending-up", description: "Stocks, ETFs, robo-advisors, or retirement funds" },
  { name: "Cash", sub_type: "cash" as AccountSubType, icon: "banknote", description: "Physical cash you have on hand" },
] as const;
