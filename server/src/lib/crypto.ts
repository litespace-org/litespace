import crypto from "node:crypto";

export function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function randomBytes(): string {
  return crypto.randomBytes(20).toString("hex");
}
