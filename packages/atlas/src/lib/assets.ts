import { backends } from "@/configs";
import { Backend } from "@litespace/types";

export function asAssetUrl(backend: Backend, file: string): string {
  const base = backends.main[backend];
  return new URL(`/assets/${file}`, base).toString();
}

export function asReceiptUrl(backend: Backend, file: string) {
  const base = backends.main[backend];
  return new URL(`/assets/receipts/${file}`, base).toString();
}

export function asFullUrl(base: string, pathname: string): string {
  return new URL(pathname, base).href;
}
