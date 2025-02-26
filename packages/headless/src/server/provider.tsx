import { Env } from "@litespace/types";
import { ServerContext, Context } from "@/server/context";
import { AuthToken, TokenType } from "@litespace/atlas";
import { useCallback, useMemo, useState } from "react";
import { AbstractStorage } from "@/storage";
import { CacheKey } from "@/constants/cache";

export const ServerProvider: React.FC<{
  server: Env.Server;
  children?: React.ReactNode;
  storage?: AbstractStorage;
}> = ({ children, server, storage }) => {
  const [token, setToken] = useState<AuthToken | null>(
    storage?.get(CacheKey.AuthToken) || null
  );

  const setAuthToken = useCallback(
    (token: AuthToken, remember: boolean = true) => {
      setToken(token);
      if (remember) storage?.set(CacheKey.AuthToken, token);
    },
    [storage]
  );

  const setBearerToken = useCallback(
    (value: string, remember: boolean = true) => {
      setAuthToken({ type: TokenType.Bearer, value }, remember);
    },
    [setAuthToken]
  );

  const setBasicToken = useCallback(
    (value: string, remember: boolean = true) => {
      setAuthToken({ type: TokenType.Basic, value }, remember);
    },
    [setAuthToken]
  );

  const removeToken = useCallback(() => {
    setToken(null);
    storage?.remove(CacheKey.AuthToken);
  }, [storage]);

  const context = useMemo(
    (): Context => ({
      setAuthToken,
      setBearerToken,
      setBasicToken,
      removeToken,
      server,
      token,
    }),
    [removeToken, server, setAuthToken, setBasicToken, setBearerToken, token]
  );

  return (
    <ServerContext.Provider value={context}>{children}</ServerContext.Provider>
  );
};
