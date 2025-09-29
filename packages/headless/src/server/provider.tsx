import React, { useEffect } from "react";
import { Env } from "@litespace/types";
import { ServerContext, Context } from "@/server/context";
import { AuthToken, TokenType } from "@litespace/atlas";
import { useCallback, useMemo, useState } from "react";
import { AbstractStorage } from "@/storage";
import { CacheKey } from "@/constants/cache";
import zod from "zod";
import dayjs from "@/lib/dayjs";

const tokenPayload = zod.object({
  id: zod.number(),
  iat: zod.number(),
  exp: zod.number(),
});

function getTokenPayload(token: string): Context["tokenPayload"] {
  const rawPayloadBase64 = token.split(".")[1];
  if (!rawPayloadBase64) return;
  const rawPayloadJson = atob(rawPayloadBase64);
  return tokenPayload.parse(JSON.parse(rawPayloadJson));
}

export const ServerProvider: React.FC<{
  server: Env.Server;
  children?: React.ReactNode;
  storage?: AbstractStorage;
}> = ({ children, server, storage }) => {
  const [token, setToken] = useState<AuthToken | null>(null);

  useEffect(() => {
    storage
      ?.get<AuthToken>(CacheKey.AuthToken)
      .then((token) => setToken(token));
  }, [storage]);

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

  const removeToken = useCallback(() => {
    setToken(null);
    storage?.remove(CacheKey.AuthToken);
  }, [storage]);

  const context = useMemo((): Context => {
    const tokenPayload =
      token?.type === TokenType.Bearer
        ? getTokenPayload(token.value)
        : undefined;

    const tokenExpired = tokenPayload
      ? dayjs.unix(tokenPayload.exp).utc().isBefore(dayjs.utc())
      : undefined;

    return {
      setAuthToken,
      setBearerToken,
      removeToken,
      server,
      token,
      tokenPayload,
      tokenExpired,
      canPerformPrivateRequests: !!token && !tokenExpired,
    };
  }, [removeToken, server, setAuthToken, setBearerToken, token]);

  return (
    <ServerContext.Provider value={context}>{children}</ServerContext.Provider>
  );
};
