-- Row Level Security Policies
-- Phase 1: Single user per household (user_id on households table)

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE net_worth_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
-- supported_currencies is a public reference table, no RLS needed

-- ============================================================
-- Helper: Get household IDs for the current user
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_household_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM households WHERE user_id = auth.uid();
$$;

-- ============================================================
-- HOUSEHOLDS
-- ============================================================
CREATE POLICY "Users can view own households"
  ON households FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create households"
  ON households FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own households"
  ON households FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own households"
  ON households FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- ACCOUNTS
-- ============================================================
CREATE POLICY "Users can view accounts in their households"
  ON accounts FOR SELECT
  USING (household_id IN (SELECT get_user_household_ids()));

CREATE POLICY "Users can create accounts in their households"
  ON accounts FOR INSERT
  WITH CHECK (household_id IN (SELECT get_user_household_ids()));

CREATE POLICY "Users can update accounts in their households"
  ON accounts FOR UPDATE
  USING (household_id IN (SELECT get_user_household_ids()));

CREATE POLICY "Users can delete accounts in their households"
  ON accounts FOR DELETE
  USING (household_id IN (SELECT get_user_household_ids()));

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE POLICY "Users can view categories in their households"
  ON categories FOR SELECT
  USING (household_id IN (SELECT get_user_household_ids()));

CREATE POLICY "Users can create categories in their households"
  ON categories FOR INSERT
  WITH CHECK (household_id IN (SELECT get_user_household_ids()));

CREATE POLICY "Users can update categories in their households"
  ON categories FOR UPDATE
  USING (household_id IN (SELECT get_user_household_ids()));

CREATE POLICY "Users can delete categories in their households"
  ON categories FOR DELETE
  USING (household_id IN (SELECT get_user_household_ids()));

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE POLICY "Users can view transactions in their households"
  ON transactions FOR SELECT
  USING (household_id IN (SELECT get_user_household_ids()));

CREATE POLICY "Users can create transactions in their households"
  ON transactions FOR INSERT
  WITH CHECK (household_id IN (SELECT get_user_household_ids()));

CREATE POLICY "Users can update transactions in their households"
  ON transactions FOR UPDATE
  USING (household_id IN (SELECT get_user_household_ids()));

CREATE POLICY "Users can delete transactions in their households"
  ON transactions FOR DELETE
  USING (household_id IN (SELECT get_user_household_ids()));

-- ============================================================
-- TRANSACTION ENTRIES (access through transaction's household)
-- ============================================================
CREATE POLICY "Users can view entries for their transactions"
  ON transaction_entries FOR SELECT
  USING (
    transaction_id IN (
      SELECT id FROM transactions
      WHERE household_id IN (SELECT get_user_household_ids())
    )
  );

CREATE POLICY "Users can create entries for their transactions"
  ON transaction_entries FOR INSERT
  WITH CHECK (
    transaction_id IN (
      SELECT id FROM transactions
      WHERE household_id IN (SELECT get_user_household_ids())
    )
  );

CREATE POLICY "Users can update entries for their transactions"
  ON transaction_entries FOR UPDATE
  USING (
    transaction_id IN (
      SELECT id FROM transactions
      WHERE household_id IN (SELECT get_user_household_ids())
    )
  );

CREATE POLICY "Users can delete entries for their transactions"
  ON transaction_entries FOR DELETE
  USING (
    transaction_id IN (
      SELECT id FROM transactions
      WHERE household_id IN (SELECT get_user_household_ids())
    )
  );

-- ============================================================
-- NET WORTH SNAPSHOTS
-- ============================================================
CREATE POLICY "Users can view snapshots for their households"
  ON net_worth_snapshots FOR SELECT
  USING (household_id IN (SELECT get_user_household_ids()));

CREATE POLICY "Users can manage snapshots for their households"
  ON net_worth_snapshots FOR ALL
  USING (household_id IN (SELECT get_user_household_ids()));

-- ============================================================
-- TRANSACTION TEMPLATES
-- ============================================================
CREATE POLICY "Users can view templates in their households"
  ON transaction_templates FOR SELECT
  USING (household_id IN (SELECT get_user_household_ids()));

CREATE POLICY "Users can manage templates in their households"
  ON transaction_templates FOR ALL
  USING (household_id IN (SELECT get_user_household_ids()));

-- ============================================================
-- TEMPLATE ENTRIES
-- ============================================================
CREATE POLICY "Users can view template entries"
  ON template_entries FOR SELECT
  USING (
    template_id IN (
      SELECT id FROM transaction_templates
      WHERE household_id IN (SELECT get_user_household_ids())
    )
  );

CREATE POLICY "Users can manage template entries"
  ON template_entries FOR ALL
  USING (
    template_id IN (
      SELECT id FROM transaction_templates
      WHERE household_id IN (SELECT get_user_household_ids())
    )
  );

-- ============================================================
-- USER PREFERENCES
-- ============================================================
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  USING (user_id = auth.uid());

-- ============================================================
-- EXCHANGE RATES (readable by all authenticated users)
-- ============================================================
CREATE POLICY "Authenticated users can view exchange rates"
  ON exchange_rates FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert exchange rates"
  ON exchange_rates FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
