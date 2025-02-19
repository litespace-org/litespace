import { Env } from "@litespace/types";
import { ServerContext, Context } from "@/server/context";
import { AuthToken, TokenType } from "@litespace/atlas";
import { useCallback, useMemo, useState } from "react";
import { AbstractStorage, StorageWrapper } from "@/storage";
import { CacheKey } from "@/constants/cache";

export const ServerProvider: React.FC<{
  server: Env.Server;
  children?: React.ReactNode;
  storage?: AbstractStorage;
}> = ({ children, server, storage }) => {
  // NOTE: browser localStorage is assigned as default, in order to
  // be compatible with the base code with minimal modifications possible.
  const cache = useMemo(
    () => new StorageWrapper(storage || localStorage),
    [storage]
  );

  const [token, setToken] = useState<AuthToken | null>(
    cache.load(CacheKey.AuthToken)
  );

  const setAuthToken = useCallback(
    (token: AuthToken, remember: boolean = true) => {
      setToken(token);
      if (remember) cache.save(CacheKey.AuthToken, token);
    },
    [cache]
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
    cache.remove(CacheKey.AuthToken);
  }, [cache]);

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
