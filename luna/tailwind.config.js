/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preflight: true,
  },
  prefix: "ui-",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    fontFamily: {
      cairo: ["Cairo", "sans-serif"],
    },
    extend: {
      colors: {
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
        control: "hsl(var(--border-control))",
        foreground: {
          DEFAULT: "hsl(var(--foreground-default))",
          muted: "hsl(var(--foreground-muted))",
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
        background: {
          200: "hsl(var(--background-200))",
          control: "hsl(var(--background-control))",
        },
      },
      keyframes: {},
    },
  },
  plugins: [],
};
