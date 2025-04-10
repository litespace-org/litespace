import { createContext, useContext } from "react";
import { Logger } from "@/logger/types";

type LoggerContext = Logger;

export const Context = createContext<LoggerContext | null>(null);

export function useLogger() {
  const context = useContext(Context);
  if (!context) throw new Error("useLogger must be used within its provider.");
  return context;
}
