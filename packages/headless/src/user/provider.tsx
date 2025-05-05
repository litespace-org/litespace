import React, { useCallback, useEffect, useMemo, useState } from "react";
import { UserContext, Context } from "@/user/context";
import { useCurrentUser } from "@/user";
import { LocalStorage } from "@/storage/local";
import { CacheKey } from "@/constants";
import { ITutor, IUser } from "@litespace/types";
import { useFindTutorMeta } from "@/tutor";
import { useServer } from "@/server";
import dayjs from "@/lib/dayjs";
import { useRefreshAuthToken } from "@/auth";
import { TokenType } from "@litespace/atlas";
import { isTutor } from "@litespace/utils";

type Data = {
  user: IUser.Self | null;
  meta: ITutor.Self | null;
};

const defaultData: Data = {
  user: null,
  meta: null,
};

const cache = new LocalStorage();

const userCache = cache.get<Data>(CacheKey.User);

/**
 * - Cache and load user data and metadata.
 * - Set auth token on refersh user data.
 */
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userData, setUserData] = useState<Data>(userCache || defaultData);
  const { token, tokenPayload, tokenExpired, setBearerToken, removeToken } =
    useServer();

  //=================== Refersh token =====================

  const refershToken = useRefreshAuthToken({
    onSuccess: (token) => {
      setBearerToken(token, true);
    },
  });

  const shouldRefreshToken = useMemo(() => {
    return (
      token?.type === TokenType.Bearer &&
      !!tokenPayload?.exp &&
      // Refersh the auth token if it has 2 days left until expiry.
      dayjs.unix(tokenPayload.exp).utc().diff(dayjs.utc(), "day", true) <= 2
    );
  }, [token?.type, tokenPayload?.exp]);

  useEffect(() => {
    if (shouldRefreshToken && !refershToken.isPending && !refershToken.isError)
      refershToken.mutate();
  }, [refershToken, shouldRefreshToken]);

  //=================== User state handlers =====================
  const setData: Context["set"] = useCallback(
    ({ user, meta, token, remember = true }) => {
      if (token) setBearerToken(token, remember);
      setUserData((prev) => {
        const data: Data = {
          user: user || prev.user,
          meta: meta || prev.meta,
        };
        if (remember) cache.set(CacheKey.User, data);
        return data;
      });
    },
    [setBearerToken]
  );

  const logout = useCallback(() => {
    cache.remove(CacheKey.User);
    setUserData(defaultData);
    removeToken();
  }, [removeToken]);

  //=================== User data (and tutor's metadata) =====================
  const { query: user } = useCurrentUser(!tokenExpired && !!token);

  const tutorId = useMemo(() => {
    if (!isTutor(userData.user)) return;
    return userData.user.id;
  }, [userData.user]);

  const { query: meta } = useFindTutorMeta(tutorId);

  useEffect(() => {
    if (!user.data || user.isLoading || user.isFetching) return;
    setData({ user: user.data });
  }, [user.data, user.isFetching, user.isLoading, setBearerToken, setData]);

  useEffect(() => {
    if (!meta.data || meta.isLoading || meta.isFetching) return;
    setData({ meta: meta.data });
  }, [meta.data, meta.isFetching, meta.isLoading, setData]);

  const context = useMemo((): Context => {
    return {
      user: userData.user,
      meta: userData.meta,
      loading: user.isLoading || meta.isLoading,
      fetching: user.isFetching || meta.isFetching,
      isError: user.isError || meta.isError,
      error: user.error || meta.error,
      refetch: { user: user.refetch, meta: meta.refetch },
      set: setData,
      logout,
    };
  }, [
    userData.user,
    userData.meta,
    user.isLoading,
    user.isFetching,
    user.isError,
    user.error,
    user.refetch,
    meta.isLoading,
    meta.isFetching,
    meta.isError,
    meta.error,
    meta.refetch,
    setData,
    logout,
  ]);

  return (
    <UserContext.Provider value={context}>{children}</UserContext.Provider>
  );
};
