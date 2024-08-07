import { violet, blackA, mauve, green } from "@radix-ui/colors";

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
        ...mauve,
        ...violet,
        ...green,
        ...blackA,
        "dark-100": "#181B22",
        inputbg: "rgba(235, 237, 242, 0.32)",
        "blue-normal": "#3A5BAA",
        "red-light": "rgba(238, 48, 36, 0.08)",
        "red-border": "#EE3024",
      },
      keyframes: {
        overlayShow: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        contentShow: {
          from: {
            opacity: "0",
            transform: "translate(-50%, -48%) scale(0.96)",
          },
          to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
      },
      animation: {
        overlayShow: "overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        contentShow: "contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
      fontSize: {
        arsm: "0.875rem",
        arxl: "1.125rem",
      },
      lineHeight: {
        normal: "13px",
      },
      spacing: {
        lg: "16px",
        xl: "24px",
      },
    },
  },
  plugins: [],
};
