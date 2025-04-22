export function isValidCVV(cvv: string): boolean {
  const num = Number(cvv);
  if (isNaN(num)) return false;
  if (num > 999 || num < 100) return false;
  return true;
}
