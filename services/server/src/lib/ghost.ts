import { ghostConfig } from "@/constants";

export function getGhostToken(): string {
  return Buffer.from(
    [ghostConfig.username, ghostConfig.password].join(":")
  ).toString("base64");
}
