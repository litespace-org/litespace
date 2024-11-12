import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  prefix: "tw-",
  theme: {
    fontFamily: {
      cairo: ["Cairo", "sans-serif"],
    },
    extend: {
      screens: {
        "3xl": "1600px",
      },
      containers: {
        "2xs": "16rem",
        "3xs": "12rem",
        "4xs": "9rem",
      },
      colors: {
        dash: {
          sidebar: "hsl(var(--background-dash-sidebar))",
          canva: "hsl(var(--background-dash-canvas))",
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
          1000: "var(--colors-amber10)",
          1100: "var(--colors-amber11)",
          1200: "var(--colors-amber12)",
        },
        blue: {
          100: "var(--colors-blue1)",
          200: "var(--colors-blue2)",
          300: "var(--colors-blue3)",
          400: "var(--colors-blue4)",
          500: "var(--colors-blue5)",
          600: "var(--colors-blue6)",
          700: "var(--colors-blue7)",
          800: "var(--colors-blue8)",
          900: "var(--colors-blue9)",
          1000: "var(--colors-blue10)",
          1100: "var(--colors-blue11)",
          1200: "var(--colors-blue12)",
        },
        control: "hsl(var(--border-control))",
        muted: "hsl(var(--background-muted))",
        foreground: {
          DEFAULT: "hsl(var(--foreground-default))",
          muted: "hsl(var(--foreground-muted))",
          semi: "hsl(var(--foreground-semi-light))",
          light: "hsl(var(--foreground-light))",
          lighter: "hsl(var(--foreground-lighter))",
        },
        success: {
          50: "hsl(var(--success-50))",
          100: "hsl(var(--success-100))",
          200: "hsl(var(--success-200))",
          300: "hsl(var(--success-300))",
          400: "hsl(var(--success-400))",
          500: "hsl(var(--success-500))",
          600: "hsl(var(--success-600))",
          700: "hsl(var(--success-700))",
          800: "hsl(var(--success-800))",
          900: "hsl(var(--success-900))",
          950: "hsl(var(--success-950))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning-default))",
          50: "hsl(var(--warning-50))",
          100: "hsl(var(--warning-100))",
          200: "hsl(var(--warning-200))",
          300: "hsl(var(--warning-300))",
          400: "hsl(var(--warning-400))",
          500: "hsl(var(--warning-500))",
          600: "hsl(var(--warning-600))",
          700: "hsl(var(--warning-700))",
          800: "hsl(var(--warning-800))",
          900: "hsl(var(--warning-900))",
          950: "hsl(var(--warning-950))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive-default))",
          50: "hsl(var(--destructive-50))",
          100: "hsl(var(--destructive-100))",
          200: "hsl(var(--destructive-200))",
          300: "hsl(var(--destructive-300))",
          400: "hsl(var(--destructive-400))",
          500: "hsl(var(--destructive-500))",
          600: "hsl(var(--destructive-600))",
          700: "hsl(var(--destructive-700))",
          800: "hsl(var(--destructive-800))",
          900: "hsl(var(--destructive-900))",
          950: "hsl(var(--destructive-950))",
        },
        border: {
          DEFAULT: "hsl(var(--border-default))",
          stronger: "hsl(var(--border-stronger))",
          strong: "hsl(var(--border-strong))",
          alternative: "hsl(var(--border-alternative))",
          control: "hsl(var(--border-control))",
          secondary: "hsl(var(--border-secondary))",
          muted: "hsl(var(--border-muted))",
          overlay: "hsl(var(--border-overlay))",
          button: {
            DEFAULT: "hsl(var(--border-button-default))",
            hover: "hsl(var(--border-button-hover))",
          },
        },
        background: {
          DEFAULT: "hsl(var(--background-default))",
          200: "hsl(var(--background-200))",
          control: "hsl(var(--background-control))",
          selection: "hsl(var(--background-selection))",
          overlay: {
            DEFAULT: "hsl(var(--background-overlay-default))",
            hover: "hsl(var(--background-overlay-hover))",
          },
          dialog: {
            DEFAULT: "hsl(var(--background-dialog-default))",
          },
          button: {
            DEFAULT: "hsl(var(--background-button-default))",
          },
          alternative: {
            DEFAULT: "hsl(var(--background-alternative-default))",
            200: "hsl(var(--background-alternative-200))",
          },
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
          50: "hsl(var(--brand-50))",
          100: "hsl(var(--brand-100))",
          200: "hsl(var(--brand-200))",
          300: "hsl(var(--brand-300))",
          400: "hsl(var(--brand-400))",
          500: "hsl(var(--brand-500))",
          600: "hsl(var(--brand-600))",
          700: "hsl(var(--brand-700))",
          800: "hsl(var(--brand-800))",
          900: "hsl(var(--brand-900))",
          1: "var(--colors-brand1)",
          2: "var(--colors-brand2)",
          3: "var(--colors-brand3)",
          4: "var(--colors-brand4)",
          5: "var(--colors-brand5)",
          6: "var(--colors-brand6)",
          7: "var(--colors-brand7)",
          8: "var(--colors-brand8)",
          9: "var(--colors-brand9)",
          10: "var(--colors-brand10)",
          11: "var(--colors-brand11)",
          12: "var(--colors-brand12)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary-default))",
          50: "hsl(var(--secondary-50))",
          100: "hsl(var(--secondary-100))",
          200: "hsl(var(--secondary-200))",
          300: "hsl(var(--secondary-300))",
          400: "hsl(var(--secondary-400))",
          500: "hsl(var(--secondary-500))",
          600: "hsl(var(--secondary-600))",
          700: "hsl(var(--secondary-700))",
          800: "hsl(var(--secondary-800))",
          900: "hsl(var(--secondary-900))",
          950: "hsl(var(--secondary-950))",
        },
        natural: {
          DEFAULT: "hsl(var(--natural-default))",
          50: "hsl(var(--natural-50))",
          100: "hsl(var(--natural-100))",
          200: "hsl(var(--natural-200))",
          300: "hsl(var(--natural-300))",
          400: "hsl(var(--natural-400))",
          500: "hsl(var(--natural-500))",
          600: "hsl(var(--natural-600))",
          700: "hsl(var(--natural-700))",
          800: "hsl(var(--natural-800))",
          900: "hsl(var(--natural-900))",
          950: "hsl(var(--natural-950))",
        },
        "calendar-day-level": {
          1: "var(--color-calendar-graph-day-L1-bg)",
          2: "var(--color-calendar-graph-day-L2-bg)",
          3: "var(--color-calendar-graph-day-L3-bg)",
          4: "var(--color-calendar-graph-day-L4-bg)",
        },
        "calendar-day-border-level": {
          1: "var(--color-calendar-graph-day-L1-border)",
          2: "var(--color-calendar-graph-day-L2-border)",
          3: "var(--color-calendar-graph-day-L3-border)",
          4: "var(--color-calendar-graph-day-L4-border)",
        },
      },
      boxShadow: {
        sm: "0px 6px 20px 0px #00000014",
        md: "0px 6px 20px 0px #00000026",
        lg: "0px 6px 20px 0px #00000033",
        xl: "0px 6px 20px 0px #00000040",
      },
      keyframes: {
        hide: {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in": {
          from: {
            transform: "translateX(-25px)",
          },
          to: { transform: "translateX(0)" },
        },
        "swipe-out": {
          from: { transform: "translateX(var(--radix-toast-swipe-end-x))" },
          to: {
            transform: "translateX(calc(-100% - var(--viewport-padding)))",
          },
        },
      },
      animation: {
        hide: "hide 100ms ease-in",
        "slide-in": "slide-in 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "swipe-out": "swipe-out 100ms ease-out",
      },
    },
    boxShadow: {
      "ls-small": "0px 6px 20px 0px rgba(0, 0, 0, 0.08)",
      "ls-medium": "0px 6px 20px 0px rgba(0, 0, 0, 0.15)",
      "ls-large": "0px 6px 20px 0px rgba(0, 0, 0, 0.2)",
      "ls-x-large": "0px 6px 20px 0px rgba(0, 0, 0, 0.25)",
    },
  },
  plugins: [
    require("tailwind-scrollbar"),
    require("@tailwindcss/container-queries"),
    plugin(({ addVariant }) => {
      addVariant("webkit-slider-thumb", "&::-webkit-slider-thumb");
      addVariant("moz-slider-thumb", "&::-moz-range-thumb");
    }),
  ],
};
