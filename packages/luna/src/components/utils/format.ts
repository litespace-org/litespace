import humanize from "humanize-duration";

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en").format(value);
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

export function formatMinutes(value: number): string {
  return humanize(value * 60 * 1000, {
    language: "ar",
    digitReplacements: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  });
}
