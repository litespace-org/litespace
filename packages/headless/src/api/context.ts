import { Api } from "@litespace/atlas";
import { createContext, useContext } from "react";

export const ApiContext = createContext<Api | null>(null);

export function useApi() {
  const api = useContext(ApiContext);
  if (!api) throw new Error("useApi must be used within its provider.");
  return api;
}
