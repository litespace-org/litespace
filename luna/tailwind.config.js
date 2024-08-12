/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    fontFamily: {
      cairo: ["Cairo", "sans-serif"],
    },
    extend: {
      colors: {
        dash: {
          sidebar: "hsl(var(--background-dash-sidebar))",
        },
        red: {
          100: "var(--colors-red1)",
          200: "var(--colors-red2)",
          300: "var(--colors-red3)",
          400: "var(--colors-red4)",
          500: "var(--colors-red5)",
          600: "var(--colors-red6)",
          700: "var(--colors-red7)",
          800: "var(--colors-red8)",
          900: "var(--colors-red9)",
        },
        amber: {
          100: "var(--colors-amber1)",
          200: "var(--colors-amber2)",
          300: "var(--colors-amber3)",
          400: "var(--colors-amber4)",
          500: "var(--colors-amber5)",
          600: "var(--colors-amber6)",
          700: "var(--colors-amber7)",
          800: "var(--colors-amber8)",
          900: "var(--colors-amber9)",
        },
        alternative: "hsl(var(--background-alternative-default))",
        control: "hsl(var(--border-control))",
        muted: "hsl(var(--background-muted))",
        selection: "hsl(var(--background-selection))",
        foreground: {
          DEFAULT: "hsl(var(--foreground-default))",
          muted: "hsl(var(--foreground-muted))",
          light: "hsl(var(--foreground-light))",
          lighter: "hsl(var(--foreground-lighter))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning-default))",
          200: "hsl(var(--warning-200))",
          300: "hsl(var(--warning-300))",
          400: "hsl(var(--warning-400))",
          500: "hsl(var(--warning-500))",
          600: "hsl(var(--warning-600))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive-default))",
          200: "hsl(var(--destructive-200))",
          300: "hsl(var(--destructive-300))",
          400: "hsl(var(--destructive-400))",
          500: "hsl(var(--destructive-500))",
          600: "hsl(var(--destructive-600))",
        },
        border: {
          DEFAULT: "hsl(var(--border-default))",
          stronger: "hsl(var(--border-stronger))",
          strong: "hsl(var(--border-strong))",
          alternative: "hsl(var(--border-alternative))",
          control: "hsl(var(--border-control))",
          secondary: "hsl(var(--border-secondary))",
          muted: "hsl(var(--border-muted))",
        },
        overlay: "hsl(var(--border-overlay))",
        background: {
          200: "hsl(var(--background-200))",
          control: "hsl(var(--background-control))",
        },
        surface: {
          75: "hsl(var(--background-surface-75))",
          100: "hsl(var(--background-surface-100))",
          200: "hsl(var(--background-surface-200))",
          300: "hsl(var(--background-surface-300))",
          400: "hsl(var(--background-surface-400))",
        },
        brand: {
          DEFAULT: "hsl(var(--brand-default))",
          link: "hsl(var(--brand-link))",
          button: "hsl(var(--brand-button))",
          200: "hsl(var(--brand-200))",
          300: "hsl(var(--brand-300))",
          400: "hsl(var(--brand-400))",
          500: "hsl(var(--brand-500))",
          600: "hsl(var(--brand-600))",
        },
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
