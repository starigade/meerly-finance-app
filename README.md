# Meerly Finance Tracker

A cross-platform personal finance tracker built with **React Native**, **Expo**, and **NativeWind (Tailwind CSS)**.

## Features

- 💰 Track income and expenses
- 📊 View balance and transaction history
- 💾 Local storage (data persists on device)
- 🌐 Works on Web, iOS, and Android

## Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and tooling
- **Expo Router** - File-based navigation
- **NativeWind** - Tailwind CSS for React Native
- **TypeScript** - Type safety

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app (for mobile testing)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on web
npm run web

# Run on iOS (macOS only)
npm run ios

# Run on Android
npm run android
```

### Development

- Press `w` in the terminal to open web build
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `m` to toggle developer menu

## Project Structure

```
meerly-finance-app/
├── app/
│   ├── _layout.tsx      # Root layout with navigation
│   ├── index.tsx        # Home screen (transactions list)
│   ├── global.css       # Global styles
│   ├── components/      # Reusable components
│   ├── screens/         # Screen components
│   └── utils/           # Utility functions
├── assets/              # Images, fonts, etc.
├── node_modules/
├── package.json
├── babel.config.js
├── metro.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Building for Production

### Web

```bash
npm run build:web
```

The web build will be in the `dist/` folder. Deploy to Vercel, Netlify, or any static hosting.

### Mobile

Build using EAS Build or export locally:

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for app stores
eas build --platform all
```

## License

ISC
