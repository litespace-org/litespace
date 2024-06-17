export function formatEgp(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EGP",
  }).format(value);
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(value / 100);
}
