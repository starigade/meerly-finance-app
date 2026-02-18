-- CSV Import Support
-- Adds import_hash for duplicate detection and column mapping storage

-- ============================================================
-- Add import_hash to transactions for duplicate detection
-- ============================================================
ALTER TABLE transactions
  ADD COLUMN import_hash TEXT;

CREATE INDEX idx_transactions_import_hash
  ON transactions(household_id, import_hash)
  WHERE import_hash IS NOT NULL;

-- ============================================================
-- CSV Column Mappings (stores mapping profiles per account)
-- ============================================================
CREATE TABLE csv_column_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  mapping JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (household_id, account_id)
);

CREATE TRIGGER set_csv_column_mappings_updated_at
  BEFORE UPDATE ON csv_column_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
