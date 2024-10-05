export function formatNumber(value: number) {
  return new Intl.NumberFormat("en").format(value);
}
