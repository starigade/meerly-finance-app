/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm, approachable palette (Notion/YNAB inspired)
        brand: {
          50: "#fef7ed",
          100: "#fdecd4",
          200: "#fad5a8",
          300: "#f6b871",
          400: "#f19038",
          500: "#ee7b18",
          600: "#df600e",
          700: "#b9470e",
          800: "#933813",
          900: "#773013",
          950: "#401607",
        },
        surface: {
          DEFAULT: "#fefcf9",
          secondary: "#f9f5f0",
          tertiary: "#f3ede5",
        },
        muted: {
          DEFAULT: "#8b8177",
          foreground: "#6b6157",
        },
        success: {
          DEFAULT: "#16a34a",
          light: "#dcfce7",
        },
        danger: {
          DEFAULT: "#dc2626",
          light: "#fee2e2",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        card: "0 2px 8px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        elevated: "0 4px 16px 0 rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
      },
    },
  },
  plugins: [],
};
