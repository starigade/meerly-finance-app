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

## DaisyUI Theme (warm palette)
- primary: #ee7b18 (brand orange)
- primary-content: #ffffff
- base-100: #fefcf9 (warm white)
- base-200: #f9f5f0 (warm gray)
- base-300: #f3ede5 (border gray)
- base-content: #1c1917 (near black)
- neutral: #78716c (muted text)
- success: #16a34a
- error: #dc2626

## Spacing
- Card padding: p-4
- Section gaps: gap-4
- Table cells: px-4 py-2.5
- Border radius: rounded-xl (cards), rounded-lg (buttons, inputs)

## Layout
- Dashboard: CSS grid, viewport height, no max-width
- Data pages: No max-width, responsive grid
- Form pages: max-w-2xl mx-auto
- Sidebar: w-52 on desktop, drawer overlay on mobile
