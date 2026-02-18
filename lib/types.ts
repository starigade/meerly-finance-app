// ============================================================
// Database row types (matching PostgreSQL schema)
// ============================================================

export type AccountType = "asset" | "liability" | "equity";

export type AccountSubType =
  | "checking"
  | "savings"
  | "investment"
  | "property"
  | "cash"
  | "other_asset"
  | "credit_card"
  | "mortgage"
  | "student_loan"
  | "personal_loan"
  | "other_liability"
  | "opening_balances";

export type CategoryType = "income" | "expense";

export type TransactionUIType =
  | "expense"
  | "income"
  | "transfer"
  | "debt_payment"
  | "opening_balance";

// ============================================================
// Row types
// ============================================================

export interface Household {
  id: string;
  name: string;
  base_currency: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  household_id: string;
  name: string;
  account_type: AccountType;
  sub_type: AccountSubType;
  currency: string;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  opening_balance: number; // BIGINT cents
  opening_balance_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Category {
  id: string;
  household_id: string;
  name: string;
  category_type: CategoryType;
  parent_id: string | null;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Transaction {
  id: string;
  household_id: string;
  date: string;
  description: string | null;
  notes: string | null;
  ui_type: TransactionUIType;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  deleted_at: string | null;
}

export interface TransactionEntry {
  id: string;
  transaction_id: string;
  account_id: string | null;
  category_id: string | null;
  amount: number; // BIGINT cents in native currency
  currency: string;
  base_amount: number; // BIGINT cents in household base currency
  exchange_rate: number | null;
  created_at: string;
}

export interface NetWorthSnapshot {
  id: string;
  household_id: string;
  month: string;
  net_worth_cents: number;
  created_at: string;
}

export interface TransactionTemplate {
  id: string;
  household_id: string;
  name: string;
  ui_type: TransactionUIType;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateEntry {
  id: string;
  template_id: string;
  account_id: string | null;
  category_id: string | null;
  amount: number | null;
  currency: string;
}

export interface UserPreferences {
  user_id: string;
  default_household_id: string | null;
  default_currency: string;
  date_format: string;
  theme: string;
  locale: string;
  quick_add_defaults: QuickAddDefaults;
}

export interface QuickAddDefaults {
  account_id?: string;
  category_id?: string;
}

export interface SupportedCurrency {
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
}

export interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  date: string;
  source: string;
  created_at: string;
}

// ============================================================
// View types (computed from queries)
// ============================================================

export interface AccountBalance {
  account_id: string;
  household_id: string;
  name: string;
  account_type: AccountType;
  sub_type: AccountSubType;
  currency: string;
  opening_balance: number;
  entry_total: number;
  balance: number;
  is_active: boolean;
}

export interface MonthlyPnl {
  household_id: string;
  month: string;
  category_type: CategoryType;
  category_id: string;
  category_name: string;
  parent_id: string | null;
  icon: string | null;
  color: string | null;
  total_base_cents: number;
}

// ============================================================
// Form / UI types
// ============================================================

export interface TransactionFormData {
  ui_type: TransactionUIType;
  date: string;
  description: string;
  notes: string;
  // For expense/income
  category_id: string;
  account_id: string;
  amount: string; // User input as string, converted to cents
  currency: string;
  exchange_rate: string;
  // For transfer
  from_account_id: string;
  to_account_id: string;
  to_amount: string;
  to_currency: string;
}

export interface AccountFormData {
  name: string;
  account_type: AccountType;
  sub_type: AccountSubType;
  currency: string;
  opening_balance: string;
  opening_balance_date: string;
  icon: string;
  color: string;
  notes: string;
}

export interface CategoryFormData {
  name: string;
  category_type: CategoryType;
  parent_id: string;
  icon: string;
  color: string;
}

// ============================================================
// Joined types for display
// ============================================================

export interface TransactionWithEntries extends Transaction {
  entries: (TransactionEntry & {
    account?: Pick<Account, "id" | "name" | "currency" | "icon" | "color"> | null;
    category?: Pick<Category, "id" | "name" | "category_type" | "icon" | "color"> | null;
  })[];
}

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}
