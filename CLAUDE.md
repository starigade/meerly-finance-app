# Meerly Finance Tracker

Personal finance tracker web app built with Next.js, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3
- **Deployment:** Vercel
- **Data Storage:** Browser localStorage (no backend yet)

## Project Structure

```
app/
  layout.tsx    - Root layout with metadata and font setup
  page.tsx      - Main finance tracker page (client component)
  globals.css   - Tailwind CSS imports and global styles
```

## Commands

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Conventions

- Use Tailwind CSS utility classes for all styling (no CSS modules or inline styles)
- All interactive pages must use `"use client"` directive
- Keep components in `app/` using Next.js App Router file conventions
- localStorage key for transactions: `"meerly-transactions"`

## Future Plans

- [ ] Add Expo / React Native for mobile (iOS & Android) support
- [ ] Add backend API and database for persistent storage
- [ ] User authentication
