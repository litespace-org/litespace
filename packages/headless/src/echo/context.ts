import { Echo } from "@litespace/atlas";
import { createContext, useContext } from "react";

export const EchoContext = createContext<Echo | null>(null);

export function useEcho() {
  const echo = useContext(EchoContext);
  if (!echo) throw new Error("useEcho must be used within its provider.");
  return echo;
}
