import humanize, { Options } from "humanize-duration";

export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions
) {
  return new Intl.NumberFormat("en", options).format(value);
}

/**
 * @param value floating number
 * @note numbers between 0 and 100 are mapped to 0% and 100%
 * @returns
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("en", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatMinutes(value: number, options: Options = {}): string {
  return humanize(value * 60 * 1000, {
    language: "ar",
    digitReplacements: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    ...options,
  });
}

export function formatDuration(ms: number, options: Options = {}): string {
  return humanize(ms, {
    language: "ar",
    digitReplacements: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    ...options,
  });
}

const WEEKS_AR_VARIANTS = {
  one: {
    v1: "أسبوع",
    v2: "أسبوعًا",
  },
  two: {
    v1: "أسبوعان",
    v2: "أسبوعين",
  },
  many: "أسابيع",
};

export function formatWeeks(count: number): string {
  if (count === 1) return WEEKS_AR_VARIANTS.one.v1;
  if (count === 2) return WEEKS_AR_VARIANTS.two.v2;
  if (count > 2 && count < 11) return count + " " + WEEKS_AR_VARIANTS.many;
  if (count > 10 && count < 100) return count + " " + WEEKS_AR_VARIANTS.one.v2;
  if (count > 99) return count + " " + WEEKS_AR_VARIANTS.one.v1;
  return "";
}
