import React, { useCallback, useEffect, useMemo, useState } from "react";
import { UserContext, Context } from "@/user/context";
import { useCurrentUser } from "@/user";
import { LocalStorage } from "@/storage/local";
import { CacheKey } from "@/constants";
import { useFindTutorMeta } from "@/tutor";
import { useServer } from "@/server";
import { useRefreshAuthToken } from "@/auth";
import { isTutor } from "@litespace/utils";

type Data = {
  user: Context["user"];
  meta: Context["meta"];
};

const defaultData: Data = {
  user: null,
  meta: null,
};

const cache = new LocalStorage();

/**
 * - Cache and load user data and metadata.
 * - Set auth token on refersh user data.
 */
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userData, setUserData] = useState<Data>(defaultData);
  const { token, tokenExpired, setBearerToken, removeToken } = useServer();

  useEffect(() => {
    cache.get<Data>(CacheKey.User).then((data) => data && setUserData(data));
  }, []);

  // =================== refersh token =====================
  const refreshToken = useRefreshAuthToken({
    onSuccess: (token) => {
      setBearerToken(token, true);
    },
  });
  // eslint-disable-next-line
  useEffect(() => refreshToken.mutate(), []);

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
  const userQuery = useCurrentUser(!tokenExpired && !!token);

  const tutorId = useMemo(() => {
    if (!isTutor(userData.user)) return;
    return userData.user.id;
  }, [userData.user]);

  const metaQuery = useFindTutorMeta(tutorId);

  useEffect(() => {
    if (!userQuery.data || userQuery.isLoading || userQuery.isFetching) return;
    setData({ user: userQuery.data });
  }, [
    setBearerToken,
    setData,
    userQuery.data,
    userQuery.isLoading,
    userQuery.isFetching,
  ]);

  useEffect(() => {
    if (!metaQuery.data || metaQuery.isLoading || metaQuery.isFetching) return;
    setData({ meta: metaQuery.data });
  }, [metaQuery.data, metaQuery.isFetching, metaQuery.isLoading, setData]);

  const context = useMemo((): Context => {
    return {
      user: userData.user,
      meta: userData.meta,
      loading: userQuery.isLoading || metaQuery.isLoading,
      fetching: userQuery.isFetching || metaQuery.isFetching,
      isError: userQuery.isError || metaQuery.isError,
      error: userQuery.error || metaQuery.error,
      refetch: { user: userQuery.refetch, meta: metaQuery.refetch },
      set: setData,
      logout,
    };
  }, [
    userData.user,
    userData.meta,
    userQuery.isLoading,
    userQuery.isFetching,
    userQuery.isError,
    userQuery.error,
    userQuery.refetch,
    metaQuery.isLoading,
    metaQuery.isFetching,
    metaQuery.isError,
    metaQuery.error,
    metaQuery.refetch,
    setData,
    logout,
  ]);

  return (
    <UserContext.Provider value={context}>{children}</UserContext.Provider>
  );
};
