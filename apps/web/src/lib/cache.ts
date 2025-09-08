import { CacheKey } from "@/constants/cache";

function load<T>(key: CacheKey): T | null {
  const value = localStorage.getItem(key);
  if (!value) return null;
  return JSON.parse(value);
}

function save<T>(key: CacheKey, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function remove(key: CacheKey): void {
  localStorage.removeItem(key);
}

export function saveToken(token: string) {
  return save(CacheKey.AuthToken, token);
}

export function getToken(): string | null {
  return load(CacheKey.AuthToken);
}

export const walletPaymentQrCode = {
  save: (qr: string) => save(CacheKey.WalletQr, qr),
  get: (): string | null => load(CacheKey.WalletQr),
  remove: () => remove(CacheKey.WalletQr),
};

export const cache = { save, load, remove };
