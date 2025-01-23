const assetsMap = {
  logo: "https://raw.githubusercontent.com/litespace-org/assets/refs/heads/master/assets/logo-circle.png",
} as const;

export function getAsset(name: keyof typeof assetsMap): string {
  return assetsMap[name];
}
