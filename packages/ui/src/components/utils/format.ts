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
