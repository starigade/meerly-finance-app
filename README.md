# Meerly Finance Tracker

A personal finance tracker web app built with **Next.js**, **TypeScript**, and **Tailwind CSS**. Deployed on **Vercel**.

> **Note:** Mobile support via Expo / React Native is planned for a future release.

## Features

- Track income and expenses
- View balance and transaction history
- Local storage (data persists in browser)
- Responsive web design

## Tech Stack

- **Next.js 15** - React framework (App Router)
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Vercel** - Deployment platform

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
meerly-finance-app/
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main finance tracker page
│   └── globals.css     # Tailwind CSS imports
├── public/             # Static assets
├── CLAUDE.md           # AI assistant context
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── next.config.js
```

## Deployment

Push to GitHub and connect to Vercel. Next.js is auto-detected — zero config needed.

## Future Plans

- [ ] Expo / React Native for iOS & Android
- [ ] Backend API with database
- [ ] User authentication

## License

ISC
