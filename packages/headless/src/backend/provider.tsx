import { Backend } from "@litespace/types";
import { BackendContext, Context } from "@/backend/context";
import { AuthToken, TokenType } from "@litespace/atlas";
import { useCallback, useMemo, useState } from "react";
import { cache } from "@/cache/base";
import { CacheKey } from "@/constants/cache";

export const BackendProvider: React.FC<{
  children?: React.ReactNode;
  backend: Backend;
}> = ({ children, backend }) => {
  const [token, setToken] = useState<AuthToken | null>(
    cache.load(CacheKey.AuthToken)
  );

  const setAuthToken = useCallback((token: AuthToken) => {
    setToken(token);
    cache.save(CacheKey.AuthToken, token);
  }, []);

  const setBearerToken = useCallback(
    (value: string) => {
      setAuthToken({ type: TokenType.Bearer, value });
    },
    [setAuthToken]
  );

  const setBasicToken = useCallback(
    (value: string) => {
      setAuthToken({ type: TokenType.Basic, value });
    },
    [setAuthToken]
  );

  const removeToken = useCallback(() => {
    setToken(null);
    cache.remove(CacheKey.AuthToken);
  }, []);

  const context = useMemo(
    (): Context => ({
      setAuthToken,
      setBearerToken,
      setBasicToken,
      removeToken,
      backend,
      token,
    }),
    [backend, removeToken, setAuthToken, setBasicToken, setBearerToken, token]
  );

  return (
    <BackendContext.Provider value={context}>
      {children}
    </BackendContext.Provider>
  );
};
