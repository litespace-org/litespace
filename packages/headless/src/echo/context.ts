import { createContext, useContext } from "react";
import { Socket } from "@/echo/socket";

export type Context = {
  socket: Socket | null;
  connecting: boolean;
  connected: boolean;
};

export const EchoSocketContext = createContext<Context | null>(null);

export function useEchoSocket(): Context {
  const ctx = useContext(EchoSocketContext);
  if (!ctx) throw new Error("useEchoSocket must be used within its provider.");
  return ctx;
}
