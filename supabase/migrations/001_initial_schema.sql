-- Meerly Finance Tracker: Phase 1 Schema
-- All money values stored as BIGINT (cents/smallest currency unit)

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- HOUSEHOLDS
-- ============================================================
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'My Household',
  base_currency TEXT NOT NULL DEFAULT 'SGD',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ACCOUNTS (Balance Sheet: assets, liabilities, equity)
-- ============================================================
CREATE TYPE account_type AS ENUM ('asset', 'liability', 'equity');

CREATE TYPE account_sub_type AS ENUM (
  'checking', 'savings', 'investment', 'property', 'cash', 'other_asset',
  'credit_card', 'mortgage', 'student_loan', 'personal_loan', 'other_liability',
  'opening_balances'
);

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_type account_type NOT NULL,
  sub_type account_sub_type NOT NULL DEFAULT 'checking',
  currency TEXT NOT NULL DEFAULT 'SGD',
  icon TEXT,
  color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  opening_balance BIGINT NOT NULL DEFAULT 0,
  opening_balance_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE (household_id, name)
);

CREATE INDEX idx_accounts_household ON accounts(household_id);

-- ============================================================
-- CATEGORIES (P&L: income, expense)
-- ============================================================
CREATE TYPE category_type AS ENUM ('income', 'expense');

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category_type category_type NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE (household_id, name, parent_id)
);

CREATE INDEX idx_categories_household ON categories(household_id);

-- ============================================================
-- TRANSACTIONS (header for each financial event)
-- ============================================================
CREATE TYPE transaction_ui_type AS ENUM (
  'expense', 'income', 'transfer', 'debt_payment', 'opening_balance'
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  notes TEXT,
  ui_type transaction_ui_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_transactions_household_date
  ON transactions(household_id, date DESC)
  WHERE deleted_at IS NULL;

-- ============================================================
-- TRANSACTION ENTRIES (double-entry line items)
-- ============================================================
CREATE TABLE transaction_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
  category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
  amount BIGINT NOT NULL,
  currency TEXT NOT NULL,
  base_amount BIGINT NOT NULL,
  exchange_rate NUMERIC(15,6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Exactly one of account_id or category_id must be set
  CONSTRAINT entry_has_one_target CHECK (
    (account_id IS NOT NULL AND category_id IS NULL) OR
    (account_id IS NULL AND category_id IS NOT NULL)
  )
);

CREATE INDEX idx_entries_transaction ON transaction_entries(transaction_id);
CREATE INDEX idx_entries_account ON transaction_entries(account_id);
CREATE INDEX idx_entries_category ON transaction_entries(category_id);

-- ============================================================
-- NET WORTH SNAPSHOTS (monthly for dashboard sparkline)
-- ============================================================
CREATE TABLE net_worth_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  net_worth_cents BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (household_id, month)
);

-- ============================================================
-- TRANSACTION TEMPLATES (save-as-template for recurring)
-- ============================================================
CREATE TABLE transaction_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ui_type transaction_ui_type NOT NULL,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE template_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES transaction_templates(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount BIGINT,
  currency TEXT NOT NULL DEFAULT 'SGD'
);

-- ============================================================
-- USER PREFERENCES
-- ============================================================
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_household_id UUID REFERENCES households(id) ON DELETE SET NULL,
  default_currency TEXT NOT NULL DEFAULT 'SGD',
  date_format TEXT NOT NULL DEFAULT 'YYYY-MM-DD',
  theme TEXT NOT NULL DEFAULT 'light',
  locale TEXT NOT NULL DEFAULT 'en-SG',
  quick_add_defaults JSONB DEFAULT '{}'::jsonb
);

-- ============================================================
-- SUPPORTED CURRENCIES (reference table)
-- ============================================================
CREATE TABLE supported_currencies (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimal_places INT NOT NULL DEFAULT 2
);

-- ============================================================
-- EXCHANGE RATES (cached from API)
-- ============================================================
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC(15,6) NOT NULL,
  date DATE NOT NULL,
  source TEXT NOT NULL DEFAULT 'api',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_exchange_rates_lookup
  ON exchange_rates(from_currency, to_currency, date DESC);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_households_updated_at
  BEFORE UPDATE ON households
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_templates_updated_at
  BEFORE UPDATE ON transaction_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
