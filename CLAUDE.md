# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Meerly is a self-hostable personal finance tracker with real double-entry accounting under the hood. Multi-currency, SGD-first, warm UI.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build (also type-checks)
npm run lint         # ESLint
npm test             # Run all tests (vitest)
npm run test:watch   # Watch mode
```

To run a single test file: `npx vitest run __tests__/accounting.test.ts`

## Tech Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v3 + shadcn/ui · Supabase (PostgreSQL + Auth) · Radix UI · Framer Motion · Recharts · React Hook Form + Zod · date-fns · Lucide React · Sonner (toasts) · Vitest · Vercel

## Architecture

### Data Flow Pattern

Server components (pages) fetch data → pass to client components (forms/charts). Mutations go through Server Actions in `lib/actions.ts` which return `{ success, error }` objects. Client components use Sonner toast on failure. `revalidatePath()` refreshes server data after mutations.

### Double-Entry Accounting Model

This is the core abstraction. Every financial event creates a `transaction` header with 2+ `transaction_entries` that **sum to zero in base currency** (enforced by DB trigger).

- **Accounts** = Balance Sheet items (assets: checking, savings, etc. + liabilities: credit cards, loans). Each has `account_type` (asset/liability/equity) and `sub_type`.
- **Categories** = P&L items (income + expense). These are the counterparty in each entry.
- **System equity account** "Opening Balances" absorbs opening balance offsets.

Entry creation functions live in `lib/accounting.ts`: `createExpenseEntries()`, `createIncomeEntries()`, `createTransferEntries()`, `createOpeningBalanceEntries()`. Each returns balanced `EntryInput[]` validated by `validateBalancedEntries()`.

**Money is stored as BIGINT cents. Never use floats.** Conversion via `dollarsToCents()`/`centsToDollars()` in `lib/currency.ts`.

### Key Modules

| Module | Purpose |
|--------|---------|
| `lib/actions.ts` | All server actions (CRUD for accounts, categories, transactions, CSV import, dashboard data) |
| `lib/accounting.ts` | Double-entry logic — entry creation + validation |
| `lib/currency.ts` | Cents↔dollars, formatting (`S$1,234.56`), exchange rate conversion |
| `lib/types.ts` | All TypeScript types (DB rows, form data, CSV import) |
| `lib/constants.ts` | Account sub-types, currencies, default categories, CSV column patterns |
| `lib/csv-parser.ts` | Client-side CSV parsing (papaparse), auto-detect column mapping, SHA-256 import hash |
| `lib/supabase.ts` | Three clients: browser (client components), server (server components/actions), admin (bypasses RLS) |

### CSV Import System

Client-side parsing (no server upload): `parseCsvFile()` → `autoDetectMapping()` → `applyMapping()`. Duplicate detection via SHA-256 hash of (date + amount + description). Server action `bulkCreateTransactions()` processes in chunks of 50, reuses accounting entry functions. Column mappings saved per-account for reuse.

### UI Architecture

- **shadcn/ui** components in `components/ui/` — Radix primitives + CVA variants + CSS variable theming
- **Warm Meerly theme** via CSS variables in `globals.css`: primary (#ee7b18), warm backgrounds, stone tones
- **Framer Motion** animations: `components/motion/animated-number.tsx` (counting-up values), `components/motion/in-view.tsx` (scroll-triggered entrances), `components/dashboard-shell.tsx` (staggered page load)
- **shadcn Form** (`components/ui/form.tsx`) wraps React Hook Form + Zod for schema-driven validation (`lib/schemas.ts`)
- Mobile-first: bottom nav on mobile (<768px), shadcn Sidebar on desktop
- Dashboard uses CSS grid with metrics bar, chart, and accounts panel
- `components.json` configures shadcn (New York style, CSS variables, `@/components/ui` path)

### Route Groups

- `(auth)/` — login, signup, OAuth callback (no app shell)
- `(app)/` — main app with SidebarProvider + SidebarInset layout, auth-protected via middleware

## Supabase

- **Project ID:** `tujyvpmmtcmptiqoixco`
- **URL:** `https://tujyvpmmtcmptiqoixco.supabase.co`
- Schema lives in `supabase/migrations/` (001–005). Apply via Supabase MCP `apply_migration` or SQL editor.
- RLS policies in `002_rls_policies.sql` — all tables scoped to household via `auth.uid()`

## Conventions

- Tailwind CSS utility classes for all styling (no CSS modules or inline styles)
- Server Actions return `ActionResult<T>` = `{ success, error?, data? }`
- UI language: plain English only — say "What You Own"/"What You Owe", never "debit/credit"
- Default currency: SGD (`S$`)
- Financial figures use `font-mono tabular-nums`
- Design: warm surfaces, consistent borders (not shadows), data-dense. See `docs/design.md`.

## Git

- **Never** add `Co-Authored-By` lines to commit messages
