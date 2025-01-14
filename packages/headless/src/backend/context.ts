import { AuthToken } from "@litespace/atlas";
import { Backend, Void } from "@litespace/types";
import React, { useContext } from "react";

export type Context = {
  backend: Backend;
  token: AuthToken | null;
  setAuthToken(token: AuthToken, remember?: boolean): void;
  setBearerToken(token: string, remember?: boolean): void;
  setBasicToken(token: string, remember?: boolean): void;
  removeToken: Void;
};

export const BackendContext = React.createContext<Context | null>(null);

export function useBackend(): Context {
  const context = useContext(BackendContext);
  if (!context)
    throw new Error("Invalid context. Using outside the provider?!");
  return context;
}
