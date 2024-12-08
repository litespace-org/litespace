import { AuthToken } from "@litespace/atlas";
import { Backend, Void } from "@litespace/types";
import React, { useContext } from "react";

export type Context = {
  backend: Backend;
  token: AuthToken | null;
  setAuthToken(token: AuthToken): void;
  setBearerToken(token: string): void;
  setBasicToken(token: string): void;
  removeToken: Void;
};

export const BackendContext = React.createContext<Context | null>(null);

export function useBackend(): Context {
  const context = useContext(BackendContext);
  if (!context)
    throw new Error("Invalid context. Using outside the provider?!");
  return context;
}
