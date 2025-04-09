import React, { useCallback, useEffect, useMemo, useState } from "react";
import { UserContext, Context } from "@/user/context";
import { useCurrentUser } from "@/user";
import { LocalStorage } from "@/storage/local";
import { CacheKey } from "@/constants";
import { ITutor, IUser } from "@litespace/types";
import { useFindTutorMeta } from "@/tutor";
import { useServer } from "@/server";

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
  const { token, setBearerToken, removeToken } = useServer();
  const { query } = useCurrentUser(!!token);

  const tutorId = useMemo(() => {
    if (!userData.user?.role) return;
    const tutor = [IUser.Role.Tutor, IUser.Role.TutorManager].includes(
      userData.user.role
    );
    if (!tutor) return;
    return userData.user?.id;
  }, [userData.user?.id, userData.user?.role]);

  const { query: meta } = useFindTutorMeta(tutorId);

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

  useEffect(() => {
    if (!query.data || query.isLoading || query.isFetching) return;
    // todo: better handling for the session tokens
    // setBearerToken(query.data.token);
    setData({ user: query.data.user });
  }, [query.data, query.isFetching, query.isLoading, setBearerToken, setData]);

  useEffect(() => {
    if (!meta.data || meta.isLoading || meta.isFetching) return;
    setData({ meta: meta.data });
  }, [meta.data, meta.isFetching, meta.isLoading, setData]);

  const context = useMemo((): Context => {
    return {
      user: userData.user,
      meta: userData.meta,
      loading: query.isLoading || meta.isLoading,
      fetching: query.isFetching || meta.isFetching,
      isError: query.isError,
      refetch: { user: query.refetch, meta: meta.refetch },
      set: setData,
      error: query.error,
      logout,
    };
  }, [
    userData.user,
    userData.meta,
    query.isLoading,
    query.isFetching,
    query.isError,
    query.refetch,
    query.error,
    meta.isLoading,
    meta.isFetching,
    meta.refetch,
    setData,
    logout,
  ]);

  return (
    <UserContext.Provider value={context}>{children}</UserContext.Provider>
  );
};
