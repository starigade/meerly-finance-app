-- Seed data: supported currencies and default category templates

-- ============================================================
-- SUPPORTED CURRENCIES
-- ============================================================
INSERT INTO supported_currencies (code, name, symbol, decimal_places) VALUES
  ('SGD', 'Singapore Dollar', 'S$', 2),
  ('USD', 'US Dollar', '$', 2),
  ('EUR', 'Euro', '€', 2),
  ('GBP', 'British Pound', '£', 2),
  ('JPY', 'Japanese Yen', '¥', 0),
  ('CNY', 'Chinese Yuan', '¥', 2),
  ('MYR', 'Malaysian Ringgit', 'RM', 2),
  ('THB', 'Thai Baht', '฿', 2),
  ('IDR', 'Indonesian Rupiah', 'Rp', 0),
  ('PHP', 'Philippine Peso', '₱', 2),
  ('KRW', 'South Korean Won', '₩', 0),
  ('TWD', 'Taiwan Dollar', 'NT$', 2),
  ('HKD', 'Hong Kong Dollar', 'HK$', 2),
  ('AUD', 'Australian Dollar', 'A$', 2),
  ('NZD', 'New Zealand Dollar', 'NZ$', 2),
  ('CAD', 'Canadian Dollar', 'C$', 2),
  ('CHF', 'Swiss Franc', 'CHF', 2),
  ('INR', 'Indian Rupee', '₹', 2),
  ('VND', 'Vietnamese Dong', '₫', 0),
  ('AED', 'UAE Dirham', 'AED', 2)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- DEFAULT CATEGORY SEEDER FUNCTION
-- Called after household creation to populate default categories
-- ============================================================
CREATE OR REPLACE FUNCTION seed_default_categories(p_household_id UUID, p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Income categories
  INSERT INTO public.categories (household_id, name, category_type, icon, color, created_by) VALUES
    (p_household_id, 'Salary', 'income', 'briefcase', '#16a34a', p_user_id),
    (p_household_id, 'Freelance', 'income', 'laptop', '#059669', p_user_id),
    (p_household_id, 'Interest', 'income', 'percent', '#0d9488', p_user_id),
    (p_household_id, 'Dividends', 'income', 'trending-up', '#0891b2', p_user_id),
    (p_household_id, 'Gifts Received', 'income', 'gift', '#7c3aed', p_user_id),
    (p_household_id, 'Other Income', 'income', 'plus-circle', '#6b7280', p_user_id);

  -- Expense categories
  INSERT INTO public.categories (household_id, name, category_type, icon, color, created_by) VALUES
    (p_household_id, 'Groceries', 'expense', 'shopping-cart', '#dc2626', p_user_id),
    (p_household_id, 'Dining Out', 'expense', 'utensils', '#ea580c', p_user_id),
    (p_household_id, 'Transport', 'expense', 'car', '#d97706', p_user_id),
    (p_household_id, 'Rent', 'expense', 'home', '#ca8a04', p_user_id),
    (p_household_id, 'Utilities', 'expense', 'zap', '#65a30d', p_user_id),
    (p_household_id, 'Healthcare', 'expense', 'heart', '#e11d48', p_user_id),
    (p_household_id, 'Insurance', 'expense', 'shield', '#9333ea', p_user_id),
    (p_household_id, 'Shopping', 'expense', 'shopping-bag', '#c026d3', p_user_id),
    (p_household_id, 'Entertainment', 'expense', 'film', '#2563eb', p_user_id),
    (p_household_id, 'Education', 'expense', 'book-open', '#4f46e5', p_user_id),
    (p_household_id, 'Travel', 'expense', 'plane', '#0ea5e9', p_user_id),
    (p_household_id, 'Personal Care', 'expense', 'smile', '#f472b6', p_user_id),
    (p_household_id, 'Subscriptions', 'expense', 'repeat', '#7c3aed', p_user_id),
    (p_household_id, 'Gifts Given', 'expense', 'gift', '#be185d', p_user_id),
    (p_household_id, 'Other Expense', 'expense', 'more-horizontal', '#6b7280', p_user_id);
END;
$$;

-- Update the new user handler to also seed categories
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

  -- Seed default categories
  PERFORM public.seed_default_categories(new_household_id, NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
