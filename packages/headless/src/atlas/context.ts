import { Atlas, GetToken } from "@litespace/atlas";
import { Backend } from "@litespace/types";
import React, { useContext, useMemo } from "react";

type Context = {
  backend: Backend;
  getToken: GetToken;
};

export const BackendContext = React.createContext<Context | null>(null);

export function useBackend(): Context {
  const context = useContext(BackendContext);
  if (!context)
    throw new Error("Invalid context. Using outside the provider?!");
  return context;
}

export function useAtlas() {
  const { backend, getToken } = useBackend();
  const atlas = useMemo(() => {
    return new Atlas(backend, getToken);
  }, [backend, getToken]);
  return atlas;
}
