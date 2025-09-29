import ar from "./ar-eg.json";

export type LocalMap = Record<keyof typeof ar, keyof typeof ar>;

export type LocalId = keyof LocalMap;

function makeMessages(): LocalMap {
  const map: Partial<LocalMap> = {};
  const keys = Object.keys(ar) as Array<keyof LocalMap>;
  keys.forEach((key: keyof LocalMap) => (map[key] = key));
  return map as LocalMap;
}

export const messages = makeMessages();
