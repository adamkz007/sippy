import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--tertiary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Sippy brand colors - Nory.ai Inspired Palette
        espresso: {
          50: "#f9f8f7", 
          100: "#efedea",
          200: "#e7e4de", // Wild Sand (Background)
          300: "#cfcac3",
          400: "#a8a198",
          500: "#857d72",
          600: "#635d54",
          700: "#46413b",
          800: "#2c2925",
          900: "#16141c", // Back in Black
          950: "#0d0c11",
        },
        matcha: {
          50: "#eef9f9",
          100: "#d6f0f0",
          200: "#b3e2e2",
          300: "#84d0d0",
          400: "#4fb3b3", // Crystalsong Blue (Primary Accent)
          500: "#369696",
          600: "#2a7676",
          700: "#235f5f",
          800: "#1e4c4c",
          900: "#1b4040",
          950: "#0e2424",
        },
        latte: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
        // New Palette Colors
        giraffe: {
          DEFAULT: "#EEAA11", // Groovy Giraffe
          foreground: "#16141C",
        },
        berry: {
          DEFAULT: "#BB3381", // Very Berry
          foreground: "#FFFFFF",
        },
        orchid: {
          DEFAULT: "#3F1D50", // Obsidian Orchid
          foreground: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-work-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-scandia)", "var(--font-cabinet)", "system-ui"],
      },
      borderRadius: {
        lg: "1.5rem", // 24px
        md: "1rem",   // 16px
        sm: "0.75rem", // 12px
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

