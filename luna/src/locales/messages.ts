import ar from "@/locales/ar-eg.json" assert { type: "json" };

export type LocalMap = Record<keyof typeof ar, keyof typeof ar>;

function makeMessages(): LocalMap {
  const map: Partial<LocalMap> = {};
  const keys = Object.keys(ar) as Array<keyof LocalMap>;
  keys.forEach((key: keyof LocalMap) => (map[key] = key));
  return map as LocalMap;
}

export const messages = makeMessages();
