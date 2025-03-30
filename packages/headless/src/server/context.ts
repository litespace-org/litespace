import { AuthToken } from "@litespace/atlas";
import { Env, Void } from "@litespace/types";
import React, { useContext } from "react";

export type Context = {
  server: Env.Server;
  token: AuthToken | null;
  setAuthToken(token: AuthToken, remember?: boolean): void;
  setBearerToken(token: string, remember?: boolean): void;
  removeToken: Void;
};

export const ServerContext = React.createContext<Context | null>(null);

export function useServer(): Context {
  const context = useContext(ServerContext);
  if (!context) throw new Error(`useServer must be used within its provider.`);
  return context;
}
