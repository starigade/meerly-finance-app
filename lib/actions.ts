"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "./supabase";
import {
  createExpenseEntries,
  createIncomeEntries,
  createTransferEntries,
  createOpeningBalanceEntries,
  validateBalancedEntries,
  type EntryInput,
} from "./accounting";
import { dollarsToCents } from "./currency";
import type {
  ActionResult,
  Account,
  Category,
  Transaction,
  TransactionUIType,
  AccountType,
  AccountSubType,
  CategoryType,
} from "./types";

// ============================================================
// Auth helpers
// ============================================================

async function getAuthUser() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

async function getUserHousehold() {
  const { supabase, user } = await getAuthUser();
  const { data: household } = await supabase
    .from("households")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (!household) throw new Error("No household found");
  return { supabase, user, household };
}

// ============================================================
// ACCOUNT ACTIONS
// ============================================================

export async function createAccount(formData: {
  name: string;
  account_type: AccountType;
  sub_type: AccountSubType;
  currency: string;
  opening_balance: string;
  opening_balance_date?: string;
  icon?: string;
  color?: string;
  notes?: string;
}): Promise<ActionResult<Account>> {
  try {
    const { supabase, user, household } = await getUserHousehold();
    const openingBalanceCents = dollarsToCents(formData.opening_balance, formData.currency);

    // Create the account
    const { data: account, error } = await supabase
      .from("accounts")
      .insert({
        household_id: household.id,
        name: formData.name,
        account_type: formData.account_type,
        sub_type: formData.sub_type,
        currency: formData.currency,
        opening_balance: openingBalanceCents,
        opening_balance_date: formData.opening_balance_date || null,
        icon: formData.icon || null,
        color: formData.color || null,
        notes: formData.notes || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    // If there's an opening balance, create the opening balance transaction
    if (openingBalanceCents !== 0) {
      // Get equity account
      const { data: equityAccount } = await supabase
        .from("accounts")
        .select("id")
        .eq("household_id", household.id)
        .eq("sub_type", "opening_balances")
        .single();

      if (equityAccount) {
        const entries = createOpeningBalanceEntries({
          accountId: account.id,
          equityAccountId: equityAccount.id,
          amountCents: openingBalanceCents,
          currency: formData.currency,
          baseCurrency: household.base_currency,
        });

        // Create transaction + entries
        const { data: txn, error: txnError } = await supabase
          .from("transactions")
          .insert({
            household_id: household.id,
            date: formData.opening_balance_date || new Date().toISOString().split("T")[0],
            description: `Opening balance: ${formData.name}`,
            ui_type: "opening_balance" as TransactionUIType,
            created_by: user.id,
          })
          .select()
          .single();

        if (txnError) return { success: false, error: txnError.message };

        const { error: entryError } = await supabase
          .from("transaction_entries")
          .insert(
            entries.map((e) => ({
              transaction_id: txn.id,
              account_id: e.account_id || null,
              category_id: e.category_id || null,
              amount: e.amount,
              currency: e.currency,
              base_amount: e.base_amount,
              exchange_rate: e.exchange_rate || null,
            }))
          );

        if (entryError) return { success: false, error: entryError.message };
      }
    }

    revalidatePath("/accounts");
    revalidatePath("/");
    return { success: true, data: account };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateAccount(
  id: string,
  formData: {
    name?: string;
    icon?: string;
    color?: string;
    notes?: string;
    is_active?: boolean;
  }
): Promise<ActionResult> {
  try {
    const { supabase } = await getAuthUser();
    const { error } = await supabase.from("accounts").update(formData).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/accounts");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getAccounts(): Promise<Account[]> {
  const { supabase, household } = await getUserHousehold();
  const { data } = await supabase
    .from("accounts")
    .select("*")
    .eq("household_id", household.id)
    .neq("account_type", "equity")
    .order("account_type")
    .order("name");
  return data ?? [];
}

export async function getAccountBalances() {
  const { supabase, household } = await getUserHousehold();
  const { data } = await supabase
    .from("account_balances")
    .select("*")
    .eq("household_id", household.id);
  return data ?? [];
}

// ============================================================
// CATEGORY ACTIONS
// ============================================================

export async function createCategory(formData: {
  name: string;
  category_type: CategoryType;
  parent_id?: string;
  icon?: string;
  color?: string;
}): Promise<ActionResult<Category>> {
  try {
    const { supabase, user, household } = await getUserHousehold();
    const { data, error } = await supabase
      .from("categories")
      .insert({
        household_id: household.id,
        name: formData.name,
        category_type: formData.category_type,
        parent_id: formData.parent_id || null,
        icon: formData.icon || null,
        color: formData.color || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/categories");
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateCategory(
  id: string,
  formData: { name?: string; icon?: string; color?: string; is_active?: boolean }
): Promise<ActionResult> {
  try {
    const { supabase } = await getAuthUser();
    const { error } = await supabase.from("categories").update(formData).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/categories");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getCategories(): Promise<Category[]> {
  const { supabase, household } = await getUserHousehold();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("household_id", household.id)
    .order("category_type")
    .order("name");
  return data ?? [];
}

// ============================================================
// TRANSACTION ACTIONS
// ============================================================

export async function createTransaction(formData: {
  ui_type: TransactionUIType;
  date: string;
  description: string;
  notes?: string;
  // For expense/income
  category_id?: string;
  account_id?: string;
  amount: string;
  currency: string;
  exchange_rate?: string;
  // For transfer
  from_account_id?: string;
  to_account_id?: string;
  to_amount?: string;
  to_currency?: string;
}): Promise<ActionResult<Transaction>> {
  try {
    const { supabase, user, household } = await getUserHousehold();
    const amountCents = dollarsToCents(formData.amount, formData.currency);
    const rate = formData.exchange_rate ? parseFloat(formData.exchange_rate) : undefined;

    let entries: EntryInput[];

    switch (formData.ui_type) {
      case "expense":
        if (!formData.category_id || !formData.account_id) {
          return { success: false, error: "Category and account are required for expenses" };
        }
        entries = createExpenseEntries({
          categoryId: formData.category_id,
          accountId: formData.account_id,
          amountCents,
          currency: formData.currency,
          baseCurrency: household.base_currency,
          exchangeRate: rate,
        });
        break;

      case "income":
        if (!formData.category_id || !formData.account_id) {
          return { success: false, error: "Category and account are required for income" };
        }
        entries = createIncomeEntries({
          categoryId: formData.category_id,
          accountId: formData.account_id,
          amountCents,
          currency: formData.currency,
          baseCurrency: household.base_currency,
          exchangeRate: rate,
        });
        break;

      case "transfer":
        if (!formData.from_account_id || !formData.to_account_id) {
          return { success: false, error: "Source and destination accounts are required for transfers" };
        }
        entries = createTransferEntries({
          fromAccountId: formData.from_account_id,
          toAccountId: formData.to_account_id,
          amountCents,
          fromCurrency: formData.currency,
          toCurrency: formData.to_currency ?? formData.currency,
          baseCurrency: household.base_currency,
          exchangeRate: rate,
          toAmountCents: formData.to_amount
            ? dollarsToCents(formData.to_amount, formData.to_currency ?? formData.currency)
            : undefined,
        });
        break;

      default:
        return { success: false, error: `Unsupported transaction type: ${formData.ui_type}` };
    }

    // Validate entries sum to zero
    const validation = validateBalancedEntries(entries);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Insert transaction
    const { data: txn, error: txnError } = await supabase
      .from("transactions")
      .insert({
        household_id: household.id,
        date: formData.date,
        description: formData.description || null,
        notes: formData.notes || null,
        ui_type: formData.ui_type,
        created_by: user.id,
      })
      .select()
      .single();

    if (txnError) return { success: false, error: txnError.message };

    // Insert entries
    const { error: entryError } = await supabase
      .from("transaction_entries")
      .insert(
        entries.map((e) => ({
          transaction_id: txn.id,
          account_id: e.account_id || null,
          category_id: e.category_id || null,
          amount: e.amount,
          currency: e.currency,
          base_amount: e.base_amount,
          exchange_rate: e.exchange_rate || null,
        }))
      );

    if (entryError) return { success: false, error: entryError.message };

    revalidatePath("/transactions");
    revalidatePath("/accounts");
    revalidatePath("/");
    return { success: true, data: txn };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateTransaction(
  id: string,
  formData: {
    ui_type: TransactionUIType;
    date: string;
    description: string;
    notes?: string;
    category_id?: string;
    account_id?: string;
    amount: string;
    currency: string;
    exchange_rate?: string;
    from_account_id?: string;
    to_account_id?: string;
    to_amount?: string;
    to_currency?: string;
  }
): Promise<ActionResult> {
  try {
    const { supabase, user, household } = await getUserHousehold();

    // Delete old entries
    await supabase.from("transaction_entries").delete().eq("transaction_id", id);

    // Update transaction header
    const { error: txnError } = await supabase
      .from("transactions")
      .update({
        date: formData.date,
        description: formData.description || null,
        notes: formData.notes || null,
        ui_type: formData.ui_type,
      })
      .eq("id", id);

    if (txnError) return { success: false, error: txnError.message };

    // Recreate entries (same logic as create)
    const amountCents = dollarsToCents(formData.amount, formData.currency);
    const rate = formData.exchange_rate ? parseFloat(formData.exchange_rate) : undefined;
    let entries: EntryInput[];

    switch (formData.ui_type) {
      case "expense":
        entries = createExpenseEntries({
          categoryId: formData.category_id!,
          accountId: formData.account_id!,
          amountCents,
          currency: formData.currency,
          baseCurrency: household.base_currency,
          exchangeRate: rate,
        });
        break;
      case "income":
        entries = createIncomeEntries({
          categoryId: formData.category_id!,
          accountId: formData.account_id!,
          amountCents,
          currency: formData.currency,
          baseCurrency: household.base_currency,
          exchangeRate: rate,
        });
        break;
      case "transfer":
        entries = createTransferEntries({
          fromAccountId: formData.from_account_id!,
          toAccountId: formData.to_account_id!,
          amountCents,
          fromCurrency: formData.currency,
          toCurrency: formData.to_currency ?? formData.currency,
          baseCurrency: household.base_currency,
          exchangeRate: rate,
          toAmountCents: formData.to_amount
            ? dollarsToCents(formData.to_amount, formData.to_currency ?? formData.currency)
            : undefined,
        });
        break;
      default:
        return { success: false, error: `Unsupported transaction type: ${formData.ui_type}` };
    }

    const { error: entryError } = await supabase
      .from("transaction_entries")
      .insert(
        entries.map((e) => ({
          transaction_id: id,
          account_id: e.account_id || null,
          category_id: e.category_id || null,
          amount: e.amount,
          currency: e.currency,
          base_amount: e.base_amount,
          exchange_rate: e.exchange_rate || null,
        }))
      );

    if (entryError) return { success: false, error: entryError.message };

    revalidatePath("/transactions");
    revalidatePath("/accounts");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await getAuthUser();
    // Soft delete
    const { error } = await supabase
      .from("transactions")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/transactions");
    revalidatePath("/accounts");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getTransactions(params?: {
  limit?: number;
  offset?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { supabase, household } = await getUserHousehold();
  let query = supabase
    .from("transactions")
    .select(
      `*, transaction_entries(*, account:accounts(id, name, currency, icon, color), category:categories(id, name, category_type, icon, color))`
    )
    .eq("household_id", household.id)
    .is("deleted_at", null)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (params?.startDate) query = query.gte("date", params.startDate);
  if (params?.endDate) query = query.lte("date", params.endDate);
  if (params?.search) query = query.ilike("description", `%${params.search}%`);
  if (params?.limit) query = query.limit(params.limit);
  if (params?.offset) query = query.range(params.offset, params.offset + (params.limit ?? 50) - 1);

  const { data } = await query;
  return data ?? [];
}

export async function getTransaction(id: string) {
  const { supabase } = await getAuthUser();
  const { data } = await supabase
    .from("transactions")
    .select(
      `*, transaction_entries(*, account:accounts(id, name, currency, icon, color), category:categories(id, name, category_type, icon, color))`
    )
    .eq("id", id)
    .single();
  return data;
}

// ============================================================
// DASHBOARD DATA
// ============================================================

export async function getDashboardData() {
  const { supabase, household } = await getUserHousehold();

  // Get account balances
  const { data: balances } = await supabase
    .from("account_balances")
    .select("*")
    .eq("household_id", household.id);

  // Get net worth snapshots for sparkline
  const { data: snapshots } = await supabase
    .from("net_worth_snapshots")
    .select("*")
    .eq("household_id", household.id)
    .order("month", { ascending: true })
    .limit(12);

  // Get this month's income and expenses
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const monthStart = firstOfMonth.toISOString().split("T")[0];

  const { data: monthlyEntries } = await supabase
    .from("monthly_pnl")
    .select("*")
    .eq("household_id", household.id)
    .eq("month", monthStart);

  // Get recent transactions
  const { data: recentTxns } = await supabase
    .from("transactions")
    .select(
      `*, transaction_entries(*, account:accounts(id, name, currency, icon, color), category:categories(id, name, category_type, icon, color))`
    )
    .eq("household_id", household.id)
    .is("deleted_at", null)
    .order("date", { ascending: false })
    .limit(5);

  // Calculate net worth from balances
  const netWorth = (balances ?? []).reduce((sum, b) => {
    if (b.account_type === "asset") return sum + (b.balance ?? 0);
    if (b.account_type === "liability") return sum + (b.balance ?? 0);
    return sum;
  }, 0);

  // Calculate monthly income/expense
  const monthlyIncome = (monthlyEntries ?? [])
    .filter((e) => e.category_type === "income")
    .reduce((sum, e) => sum + Math.abs(e.total_base_cents), 0);

  const monthlyExpense = (monthlyEntries ?? [])
    .filter((e) => e.category_type === "expense")
    .reduce((sum, e) => sum + e.total_base_cents, 0);

  return {
    household,
    netWorth,
    monthlyIncome,
    monthlyExpense,
    balances: balances ?? [],
    snapshots: snapshots ?? [],
    recentTransactions: recentTxns ?? [],
  };
}

// ============================================================
// ONBOARDING
// ============================================================

export async function checkOnboardingComplete(): Promise<boolean> {
  try {
    const { supabase, household } = await getUserHousehold();
    // User has completed onboarding if they have at least one non-equity account
    const { count } = await supabase
      .from("accounts")
      .select("id", { count: "exact", head: true })
      .eq("household_id", household.id)
      .neq("account_type", "equity");
    return (count ?? 0) > 0;
  } catch {
    return false;
  }
}

// ============================================================
// REPORTS
// ============================================================

export async function getMonthlyPnl(startDate: string, endDate: string) {
  const { supabase, household } = await getUserHousehold();
  const { data } = await supabase
    .from("monthly_pnl")
    .select("*")
    .eq("household_id", household.id)
    .gte("month", startDate)
    .lte("month", endDate);
  return data ?? [];
}

export async function getNetWorthReport() {
  const { supabase, household } = await getUserHousehold();
  const { data: balances } = await supabase
    .from("account_balances")
    .select("*")
    .eq("household_id", household.id)
    .eq("is_active", true);
  return { balances: balances ?? [], baseCurrency: household.base_currency };
}

// ============================================================
// TEMPLATES
// ============================================================

export async function getTemplates() {
  const { supabase, household } = await getUserHousehold();
  const { data } = await supabase
    .from("transaction_templates")
    .select(`*, template_entries(*)`)
    .eq("household_id", household.id)
    .order("name");
  return data ?? [];
}

export async function createTemplate(formData: {
  name: string;
  ui_type: TransactionUIType;
  description?: string;
  notes?: string;
  entries: { account_id?: string; category_id?: string; amount?: number; currency: string }[];
}): Promise<ActionResult> {
  try {
    const { supabase, household } = await getUserHousehold();

    const { data: template, error } = await supabase
      .from("transaction_templates")
      .insert({
        household_id: household.id,
        name: formData.name,
        ui_type: formData.ui_type,
        description: formData.description || null,
        notes: formData.notes || null,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    if (formData.entries.length > 0) {
      await supabase.from("template_entries").insert(
        formData.entries.map((e) => ({
          template_id: template.id,
          account_id: e.account_id || null,
          category_id: e.category_id || null,
          amount: e.amount ?? null,
          currency: e.currency,
        }))
      );
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ============================================================
// AUDIT
// ============================================================

export async function getImbalancedTransactions() {
  const { supabase, household } = await getUserHousehold();
  const { data } = await supabase.rpc("get_imbalanced_transactions", {
    p_household_id: household.id,
  });
  return data ?? [];
}
