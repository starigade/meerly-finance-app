# Meerly Design Principles

## Philosophy
Data-dense, warm, precise. A financial cockpit that shows everything at a glance.

## Principles
1. Fill the viewport — No scrolling for primary data on desktop
2. Minimal clicks — Panels/sheets over page navigation. Expand in place
3. Warm precision — Warm surfaces, clean borders, monospace numbers
4. Progressive density — Mobile shows key metrics; desktop shows everything
5. No decoration — No emoji, no gradient cards, no decorative icons on stats
6. Consistent borders — Cards separated by borders, not shadows

## Typography
- Font: Geist Sans (body) + Geist Mono (financial figures)
- Page headings: text-lg font-semibold (compact)
- Body: text-sm
- Labels: text-xs uppercase tracking-wider
- Money: font-mono tabular-nums

## Color System (CSS Variables in globals.css)

All colors defined as HSL values in CSS custom properties:

| Token | Color | Usage |
|-------|-------|-------|
| `--primary` | #ee7b18 | Brand orange, buttons, active states |
| `--primary-foreground` | #ffffff | Text on primary |
| `--background` | #fefcf9 | Page background (warm white) |
| `--card` | #fefcf9 | Card background |
| `--muted` / `--secondary` | #f9f5f0 | Subtle backgrounds |
| `--border` / `--input` | #f3ede5 | Borders, input outlines |
| `--foreground` | #1c1917 | Body text (near black) |
| `--muted-foreground` | #78716c | Secondary text (stone) |
| `--accent` | #f19038 | Accent highlights |
| `--destructive` | #dc2626 | Errors, negative values |
| `--success` | #16a34a | Income, positive values |

## Component Library

**shadcn/ui** (configured in `components.json`):
- Style: New York
- CSS variables enabled
- Components in `components/ui/`
- Variants via CVA (class-variance-authority)

**Motion primitives** (`components/motion/`):
- `AnimatedNumber` — Spring-based counting animation for financial figures
- `InView` — Scroll-triggered entrance animations
- `DashboardShell` — Staggered page-load reveals

## Spacing
- Card padding: p-4
- Section gaps: gap-4
- Table cells: px-4 py-2.5
- Border radius: var(--radius) = 0.5rem, rounded-lg for cards

## Layout
- Dashboard: CSS grid, viewport height, no max-width
- Data pages: No max-width, responsive grid
- Form pages: max-w-2xl mx-auto
- Sidebar: shadcn Sidebar (collapsible offcanvas) on desktop, fixed bottom nav on mobile
