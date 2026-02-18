import { createServerSupabaseClient } from "./supabase";

const FRANKFURTER_API = "https://api.frankfurter.app";

// ============================================================
// Fetch exchange rate from frankfurter.app (free, ECB data)
// ============================================================

interface FrankfurterResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

export async function fetchExchangeRate(
  from: string,
  to: string,
  date?: string
): Promise<{ rate: number; date: string } | null> {
  if (from === to) return { rate: 1, date: date ?? new Date().toISOString().split("T")[0] };

  try {
    const dateParam = date ?? "latest";
    const url = `${FRANKFURTER_API}/${dateParam}?from=${from}&to=${to}`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour

    if (!res.ok) return null;

    const data: FrankfurterResponse = await res.json();
    const rate = data.rates[to];
    if (!rate) return null;

    return { rate, date: data.date };
  } catch {
    return null;
  }
}

// ============================================================
// Get rate with DB cache
// ============================================================

export async function getExchangeRate(
  from: string,
  to: string,
  date?: string
): Promise<number | null> {
  if (from === to) return 1;

  const supabase = await createServerSupabaseClient();
  const targetDate = date ?? new Date().toISOString().split("T")[0];

  // Check DB cache first
  const { data: cached } = await supabase
    .from("exchange_rates")
    .select("rate")
    .eq("from_currency", from)
    .eq("to_currency", to)
    .eq("date", targetDate)
    .single();

  if (cached) return cached.rate;

  // Fetch from API
  const result = await fetchExchangeRate(from, to, date);
  if (!result) return null;

  // Cache in DB
  await supabase.from("exchange_rates").insert({
    from_currency: from,
    to_currency: to,
    rate: result.rate,
    date: result.date,
    source: "api",
  });

  return result.rate;
}

// ============================================================
// Batch fetch rates for multiple currencies
// ============================================================

export async function fetchMultipleRates(
  baseCurrency: string,
  targetCurrencies: string[]
): Promise<Record<string, number>> {
  const unique = [...new Set(targetCurrencies.filter((c) => c !== baseCurrency))];
  if (unique.length === 0) return {};

  try {
    const url = `${FRANKFURTER_API}/latest?from=${baseCurrency}&to=${unique.join(",")}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return {};

    const data: FrankfurterResponse = await res.json();
    return data.rates;
  } catch {
    return {};
  }
}
