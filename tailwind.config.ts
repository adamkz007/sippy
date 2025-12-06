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
        // Sippy brand colors - Warm Peach & Espresso Palette
        cream: {
          50: "#fffdf9",
          100: "#fef8ec",
          200: "#fde0b6", // Primary: Peach Cream
          300: "#fcd48f",
          400: "#f9be5a",
          500: "#f5a623",
          600: "#d9870e",
          700: "#b5690a",
          800: "#924e0d",
          900: "#78400f",
          950: "#452107",
        },
        espresso: {
          50: "#fdf7f3",
          100: "#f9ebe1",
          200: "#f3d5c2",
          300: "#ebb897",
          400: "#e19265",
          500: "#d87240",
          600: "#c85a30",
          700: "#a64528",
          800: "#863926",
          900: "#6a320d", // Secondary: Espresso Brown
          950: "#3b1807",
        },
        latte: {
          50: "#fefdfb",
          100: "#fcf9f4",
          200: "#f8f0e5",
          300: "#f2e3d0",
          400: "#e8cca8",
          500: "#dbb27e",
          600: "#c8935a",
          700: "#a6724a",
          800: "#865a40",
          900: "#6e4a37",
          950: "#3a251b",
        },
      },
      fontFamily: {
        sans: ["var(--font-work-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-outfit-heading)", "system-ui", "sans-serif"],
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

