import { Api } from "@litespace/atlas";
import { createContext, useContext } from "react";

export const AtlasContext = createContext<Api | null>(null);

export function useAtlas() {
  const atlas = useContext(AtlasContext);
  if (!atlas) throw new Error("useAtlas must be used within its provider.");
  return atlas;
}
