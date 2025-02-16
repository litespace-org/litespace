// We can add new locale to this array directly
export const locales = ["ar-eg"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar-eg";
