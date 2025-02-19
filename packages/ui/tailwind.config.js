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
      blur: {
        ellipse: "100px",
      },
      maxHeight: {
        "chat-desktop": "calc(100vh - 106px)",
        "chat-tablet": "calc(100vh - 88px)",
        "chat-mobile": "calc(100vh - 72px)",
      },
      zIndex: {
        "select-item": "1",
        "chat-avatar": "1",
        "calendar-hour": "1",
        navbar: "1",
        sidebar: "2",
        "online-indicator": "2",
        quote: "10",
        "dialog-overlay": "10",
        dialog: "11",
        "select-dropdown": "12",
        tooltip: "13",
        toast: "14",
      },
      screens: {
        "3xl": "1600px",
      },
      containers: {
        "2xs": "16rem",
        "3xs": "12rem",
        "4xs": "9rem",
      },
      backgroundImage: {
        "toast-success":
          "radial-gradient(50% 50% at 50% 50%, rgba(0, 237, 81, 0.12) 0%, rgba(0, 237, 123, 0) 100%)",
        "toast-warning":
          "radial-gradient(50% 50% at 50% 50%, rgba(255, 212, 38, 0.11) 0%, rgba(255, 212, 38, 0) 100%)",
        "toast-error":
          "radial-gradient(50% 50% at 50% 50%, rgba(240, 66, 72, 0.13) 0%, rgba(240, 66, 72, 0) 100%)",
        loader:
          "conic-gradient(from 180deg at 50% 50%, #1D7C4E 0deg, rgba(17,173,207,0) 360deg)",
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
          50: "var(--success-50)",
          100: "var(--success-100)",
          200: "var(--success-200)",
          300: "var(--success-300)",
          400: "var(--success-400)",
          500: "var(--success-500)",
          600: "var(--success-600)",
          700: "var(--success-700)",
          800: "var(--success-800)",
          900: "var(--success-900)",
          950: "var(--success-950)",
        },
        warning: {
          DEFAULT: "var(--warning-default)",
          50: "var(--warning-50)",
          100: "var(--warning-100)",
          200: "var(--warning-200)",
          300: "var(--warning-300)",
          400: "var(--warning-400)",
          500: "var(--warning-500)",
          600: "var(--warning-600)",
          700: "var(--warning-700)",
          800: "var(--warning-800)",
          900: "var(--warning-900)",
          950: "var(--warning-950)",
        },
        destructive: {
          DEFAULT: "var(--destructive-default)",
          50: "var(--destructive-50)",
          100: "var(--destructive-100)",
          200: "var(--destructive-200)",
          300: "var(--destructive-300)",
          400: "var(--destructive-400)",
          500: "var(--destructive-500)",
          600: "var(--destructive-600)",
          700: "var(--destructive-700)",
          800: "var(--destructive-800)",
          900: "var(--destructive-900)",
          950: "var(--destructive-950)",
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
          avatar: "rgba(0, 0, 0, 0.4)",
          button: {
            DEFAULT: "hsl(var(--border-button-default))",
            hover: "hsl(var(--border-button-hover))",
          },
        },
        overlay: {
          DEFAULT: "hsl(var(--background-overlay-default))",
          dialog: "var(--colors-overlay-dialog)",
        },
        background: {
          DEFAULT: "hsl(var(--background-default))",
          200: "hsl(var(--background-200))",
          control: "hsl(var(--background-control))",
          selection: "hsl(var(--background-selection))",
          video: "rgba(10, 41, 26, 0.8)",
          indicator: "rgba(0, 0, 0, 0.3)",
          internet: "rgba(51, 38, 0, 0.6)",
          speaking: "rgba(27, 84, 164, 0.8)",
          "loader-spinner": "rgba(29,124,78,1)",
          dialog: {
            DEFAULT: "hsl(var(--background-dialog-default))",
          },
          button: {
            DEFAULT: "hsl(var(--background-button-default))",
            play: "rgba(255, 255, 255, 0.25)",
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
          DEFAULT: "var(--brand-default)",
          link: "hsl(var(--brand-link))",
          button: "hsl(var(--brand-button))",
          50: "var(--brand-50)",
          100: "var(--brand-100)",
          200: "var(--brand-200)",
          300: "var(--brand-300)",
          400: "var(--brand-400)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
          800: "var(--brand-800)",
          900: "var(--brand-900)",
        },
        secondary: {
          DEFAULT: "var(--secondary-default)",
          50: "var(--secondary-50)",
          100: "var(--secondary-100)",
          200: "var(--secondary-200)",
          300: "var(--secondary-300)",
          400: "var(--secondary-400)",
          500: "var(--secondary-500)",
          600: "var(--secondary-600)",
          700: "var(--secondary-700)",
          800: "var(--secondary-800)",
          900: "var(--secondary-900)",
          950: "var(--secondary-950)",
        },
        natural: {
          DEFAULT: "var(--natural-default)",
          50: "var(--natural-50)",
          100: "var(--natural-100)",
          200: "var(--natural-200)",
          300: "var(--natural-300)",
          400: "var(--natural-400)",
          500: "var(--natural-500)",
          600: "var(--natural-600)",
          700: "var(--natural-700)",
          800: "var(--natural-800)",
          900: "var(--natural-900)",
          950: "var(--natural-950)",
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
        "discount-default": "#0A291A1A",
        "discount-primary": "#FFFFFFCC",
      },
      keyframes: {
        hide: {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in": {
          from: { transform: "translateX(-25px)" },
          to: { transform: "translateX(0)" },
        },
        "swipe-out": {
          from: { transform: "translateX(var(--radix-toast-swipe-end-x))" },
          to: {
            transform: "translateX(calc(-100% - var(--viewport-padding)))",
          },
        },
        "slide-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "slide-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        hide: "hide 100ms ease-in",
        "slide-in": "slide-in 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "swipe-out": "swipe-out 100ms ease-out",
        "slide-down": "slide-down 300ms cubic-bezier(0.87, 0, 0.13, 1)",
        "slide-up": "slide-up 300ms cubic-bezier(0.87, 0, 0.13, 1)",
      },
      lineClamp: {
        3: "3",
        4: "4",
        5: "5",
      },
    },
    boxShadow: {
      "ls-x-small": "0px 6px 20px 0px rgba(0, 0, 0, 0.08)",
      "ls-small": "0px 6px 20px 0px rgba(0, 0, 0, 0.1)",
      "ls-medium": "0px 6px 20px 0px rgba(0, 0, 0, 0.15)",
      "ls-large": "0px 6px 20px 0px rgba(0, 0, 0, 0.2)",
      "ls-x-large": "0px 6px 20px 0px rgba(0, 0, 0, 0.25)",
      sidebar: "0px 14px 42px 0px rgba(0, 0, 0, 0.08)",
      "app-sidebar": "0px 14px 42px 0px rgba(0, 0, 0, 0.08)",
      "app-navbar": "0px 4px 20px 0px rgba(0, 0, 0, 0.08)",
      "app-navbar-mobile": "0px 4px 20px 0px rgba(0, 0, 0, 0.1)",
      "input-focus": "0px 0px 10px 4px rgba(43, 181, 114, 0.25)",
      "input-error": "0px 1px 10px 4px rgba(204, 0, 0, 0.25)",
      "switch-thumb": "0px 2px 4px 0px rgba(39, 39, 39, 0.1)",
      "switch-root": "0px 4px 20px 0px rgba(43, 181, 114, 0.2)",
      "page-content": "0px 4px 20px 0px rgba(0, 0, 0, 0.1)",
      calendar: "0px 4px 20px 0px rgba(0, 0, 0, 0.08)",
      "dialog-confirm": "0px 4px 20px 0px rgba(0, 0, 0, 0.15)",
      "lesson-event-card": "0px 4px 20px 0px rgba(0, 0, 0, 0.15)",
      "lesson-upcoming-card": "0px 4px 20px 0px rgba(0, 0, 0, 0.2)",
      "mobile-lesson-upcoming-card": "0px 4px 20px 0px rgba(0, 0, 0, 0.1)",
      toast:
        "0px 16px 24px 0px rgba(0, 0, 0, 0.10), 0px 6px 30px 0px rgba(0, 0, 0, 0.10), 0px 8px 10px 0px rgba(0, 0, 0, 0.15)",
      "unread-count": "0px 4px 15px 0px rgba(29, 124, 78, 0.2)",
      "unread-count-dark": "0px 4px 15px 0px rgba(29, 124, 78, 0.2)",
      "chat-date": "0px 4px 15px 0px rgba(0, 0, 0, 0.15)",
      "chat-header": "0px 4px 20px 0px rgba(0, 0, 0, 0.08)",
      tooltip: "0px 4px 20px 0px rgba(0, 0, 0, 0.15)",
      "plan-tooltip": "0px 4px 20px 0px rgba(0, 0, 0, 0.08)",
      "feedback-card": "0px 4px 20px 0px rgba(0, 0, 0, 0.15)",
      "dark-feedback-card": "0px 4px 15px 0px rgba(255, 255, 255, 0.08)",
      "pre-call": "0px 4px 20px 0px rgba(0, 0, 0, 0.1)",
      "date-selection-item": "0px 4px 15px 0px rgba(0, 0, 0, 0.15)",
      "time-selection-item": "0px 4px 20px 0px rgba(0, 0, 0, 0.1)",
      "exclaimation-mark-video": "0px 4px 20px 1px rgba(204, 0, 0, 0.25)",
      "tutor-profile": "0px 4px 20px 0px rgba(0, 0, 0, 0.08)",
      "student-profile": "0px 4px 20px 0px rgba(0, 0, 0, 0.08)",
      "plan-card": "0px 4px 20px 0px rgba(0, 0, 0, 0.2)",
      "plan-card-label": "0px 4px 20px 0px rgba(0, 0, 0, 0.15)",
      "alert-circle": "0px 4px 15px 0px rgba(0, 0, 0, 0.1)",
      header: "0px 4px 20px 0px rgba(0, 0, 0, .1)",
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
