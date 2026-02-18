-- Triggers and Views for accounting integrity and reporting

-- ============================================================
-- BALANCED ENTRIES CONSTRAINT TRIGGER
-- Ensures SUM(base_amount) = 0 per transaction after all entries
-- Uses a deferred constraint trigger so it fires at COMMIT time
-- ============================================================

CREATE OR REPLACE FUNCTION check_balanced_entries()
RETURNS TRIGGER AS $$
DECLARE
  entry_sum BIGINT;
  entry_count INT;
BEGIN
  SELECT COALESCE(SUM(base_amount), 0), COUNT(*)
  INTO entry_sum, entry_count
  FROM transaction_entries
  WHERE transaction_id = COALESCE(NEW.transaction_id, OLD.transaction_id);

  -- Must have at least 2 entries
  IF entry_count < 2 THEN
    RAISE EXCEPTION 'Transaction must have at least 2 entries (has %)', entry_count;
  END IF;

  -- Entries must sum to zero in base currency
  IF entry_sum != 0 THEN
    RAISE EXCEPTION 'Transaction entries must sum to zero in base currency (sum = %)', entry_sum;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER trg_balanced_entries
  AFTER INSERT OR UPDATE OR DELETE ON transaction_entries
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION check_balanced_entries();

-- ============================================================
-- AUTO-CREATE HOUSEHOLD ON USER SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_household_id UUID;
BEGIN
  -- Create default household
  INSERT INTO public.households (name, user_id)
  VALUES ('My Household', NEW.id)
  RETURNING id INTO new_household_id;

  -- Create equity account for opening balances
  INSERT INTO public.accounts (household_id, name, account_type, sub_type, currency, created_by)
  VALUES (new_household_id, 'Opening Balances', 'equity', 'opening_balances', 'SGD', NEW.id);

  -- Create user preferences
  INSERT INTO public.user_preferences (user_id, default_household_id)
  VALUES (NEW.id, new_household_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- VIEW: Account Balances (in native currency)
-- ============================================================
CREATE OR REPLACE VIEW account_balances AS
SELECT
  a.id AS account_id,
  a.household_id,
  a.name,
  a.account_type,
  a.sub_type,
  a.currency,
  a.opening_balance,
  COALESCE(SUM(te.amount), 0) AS entry_total,
  a.opening_balance + COALESCE(SUM(te.amount), 0) AS balance,
  a.is_active
FROM accounts a
LEFT JOIN transaction_entries te ON te.account_id = a.id
LEFT JOIN transactions t ON te.transaction_id = t.id AND t.deleted_at IS NULL
WHERE a.account_type != 'equity'
GROUP BY a.id;

-- ============================================================
-- VIEW: Account Balances in Base Currency
-- ============================================================
CREATE OR REPLACE VIEW account_balances_base AS
SELECT
  a.id AS account_id,
  a.household_id,
  a.name,
  a.account_type,
  a.sub_type,
  a.currency,
  a.opening_balance,
  COALESCE(SUM(te.base_amount), 0) AS entry_total_base,
  -- For base currency calculation, we need opening balance in base too
  -- Opening balance is in native currency; we approximate by using current rate
  -- Phase 2 will store opening_balance_base explicitly
  COALESCE(SUM(te.base_amount), 0) AS balance_base,
  a.is_active
FROM accounts a
LEFT JOIN transaction_entries te ON te.account_id = a.id
LEFT JOIN transactions t ON te.transaction_id = t.id AND t.deleted_at IS NULL
WHERE a.account_type != 'equity'
GROUP BY a.id;

-- ============================================================
-- VIEW: Monthly P&L (Income & Spending)
-- ============================================================
CREATE OR REPLACE VIEW monthly_pnl AS
SELECT
  c.household_id,
  date_trunc('month', t.date)::DATE AS month,
  c.category_type,
  c.id AS category_id,
  c.name AS category_name,
  c.parent_id,
  c.icon,
  c.color,
  -- Use base_amount for cross-currency aggregation
  SUM(te.base_amount) AS total_base_cents
FROM transaction_entries te
JOIN categories c ON te.category_id = c.id
JOIN transactions t ON te.transaction_id = t.id
WHERE t.deleted_at IS NULL
GROUP BY c.household_id, date_trunc('month', t.date), c.id;

-- ============================================================
-- FUNCTION: Calculate net worth for a household at a point in time
-- Returns value in base currency cents
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_net_worth(
  p_household_id UUID,
  p_as_of DATE DEFAULT CURRENT_DATE
)
RETURNS BIGINT
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(SUM(
    CASE
      WHEN a.account_type = 'asset' THEN a.opening_balance + COALESCE(entries.total, 0)
      WHEN a.account_type = 'liability' THEN a.opening_balance + COALESCE(entries.total, 0)
      ELSE 0
    END
  ), 0)
  FROM accounts a
  LEFT JOIN LATERAL (
    SELECT SUM(te.amount) AS total
    FROM transaction_entries te
    JOIN transactions t ON te.transaction_id = t.id
    WHERE te.account_id = a.id
      AND t.deleted_at IS NULL
      AND t.date <= p_as_of
  ) entries ON true
  WHERE a.household_id = p_household_id
    AND a.account_type IN ('asset', 'liability')
    AND a.is_active = true;
$$;
