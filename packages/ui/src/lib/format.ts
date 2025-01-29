export function formatEgp(value: number) {
  return new Intl.NumberFormat("AR", {
    style: "currency",
    currency: "EGP",
  }).format(value);
}
