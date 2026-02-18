# Meerly Finance Tracker

A modern, self-hostable personal finance tracker with real double-entry accounting under the hood. Beautiful UI. Multi-currency. SGD-first.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v3
- **Database/Auth:** Supabase (PostgreSQL + Auth)
- **UI Primitives:** Radix UI + class-variance-authority
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Dates:** date-fns
- **Icons:** Lucide React
- **Toasts:** Sonner
- **Testing:** Vitest
- **Deployment:** Vercel

## Project Structure

```
app/
  layout.tsx                    - Root layout (providers, fonts, metadata)
  page.tsx                      - Root redirect
  globals.css                   - Tailwind imports + base styles
  (auth)/
    login/page.tsx              - Login page
    signup/page.tsx             - Signup page
    callback/route.ts           - OAuth callback
  (app)/
    layout.tsx                  - App shell (sidebar + bottom nav)
    page.tsx                    - Dashboard
    onboarding/page.tsx         - Guided setup wizard
    transactions/
      page.tsx                  - Transaction list
      new/page.tsx              - Add transaction
      [id]/page.tsx             - Edit transaction
    accounts/
      page.tsx                  - Accounts list with balances
      new/page.tsx              - Add account
      [id]/page.tsx             - Account detail + history
    categories/page.tsx         - Category management
    reports/
      income-spending/page.tsx  - Income & Spending report
      net-worth/page.tsx        - Net Worth report
    settings/
      page.tsx                  - Settings hub
      audit/page.tsx            - Books balance check
components/
  ui/                           - Button, Input, Card, Dialog, Select, Label, Tabs
  sidebar.tsx                   - Desktop sidebar nav
  bottom-nav.tsx                - Mobile bottom nav
  onboarding-wizard.tsx         - 3-step guided setup
  quick-add.tsx                 - FAB + quick entry dialog
  transaction-form.tsx          - Full transaction form (expense/income/transfer)
  transaction-list.tsx          - Transaction display list
  account-card.tsx              - Account balance card
  account-form.tsx              - Account creation form
  category-form.tsx             - Category creation form
  summary-cards.tsx             - Dashboard summary (net worth, income, spending)
  net-worth-sparkline.tsx       - 6-month net worth chart
lib/
  types.ts                      - All TypeScript types
  constants.ts                  - Default categories, account types, currencies
  supabase.ts                   - Browser + server + admin clients
  actions.ts                    - All server actions
  accounting.ts                 - Double-entry logic, entry creation, validation
  currency.ts                   - Formatting (S$1,234.56), cents↔dollars
  exchange-rates.ts             - Fetch rates from frankfurter.app
  dates.ts                      - date-fns formatting helpers
  utils.ts                      - cn() utility for Tailwind class merging
providers/
  supabase-provider.tsx         - Client-side Supabase context
middleware.ts                   - Auth redirect middleware
supabase/
  migrations/
    001_initial_schema.sql      - Tables, types, indexes
    002_rls_policies.sql        - Row-level security
    003_triggers_and_views.sql  - Balanced entries trigger, views
    004_seed_defaults.sql       - Default categories, currencies
  config.toml                   - Local Supabase config
__tests__/
  accounting.test.ts            - Double-entry logic tests
  currency.test.ts              - Currency formatting/conversion tests
```

## Commands

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run Vitest tests
- `npm run test:watch` - Run tests in watch mode

## Supabase

- **Project ID:** `tujyvpmmtcmptiqoixco`
- Use this project ID for all Supabase-related activities including MCP usage
- **Supabase URL:** `https://tujyvpmmtcmptiqoixco.supabase.co`
- All database objects are in migration files — never use the Supabase dashboard
- Money is stored as BIGINT cents, never floats
- Double-entry: every transaction has entries summing to zero in base currency

## Conventions

- Use Tailwind CSS utility classes for all styling (no CSS modules or inline styles)
- Client components use `"use client"` directive
- Server components for pages, client components for forms/charts
- Server Actions for mutations, return `{ success, error }` objects
- Sonner toast for action failures
- Mobile-first: bottom nav on mobile (<768px), sidebar on desktop
- Default currency: SGD (S$)
- UI language: plain English only (no accounting jargon like "debit/credit")

## Accounting Model

- **Accounts** = Balance Sheet (assets + liabilities)
- **Categories** = P&L (income + expense)
- **System equity account** "Opening Balances" auto-created per household
- Every transaction has 2+ entries that sum to zero in base currency
- DB constraint trigger enforces balanced entries

## Git

- **Never** add `Co-Authored-By` lines to commit messages
