import crypto from "node:crypto";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function isSamePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
