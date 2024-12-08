import React, { useCallback, useEffect, useMemo, useState } from "react";
import { UserContext, Context } from "@/user/context";
import { useCurrentUser } from "@/user";
import { cache } from "@/cache/base";
import { CacheKey } from "@/constants";
import { ITutor, IUser } from "@litespace/types";
import { useFindTutorMeta } from "@/tutor";
import { useBackend } from "@/backend";

type Data = {
  user: IUser.Self | null;
  meta: ITutor.Self | null;
};

const defaultData: Data = {
  user: null,
  meta: null,
};

const userCache = cache.load<Data>(CacheKey.User);

/**
 * - Cache and load user data and metadata.
 * - Set auth token on refersh user data.
 */
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userData, setUserData] = useState<Data>(userCache || defaultData);
  const { token, setBearerToken, removeToken } = useBackend();
  const query = useCurrentUser(!!token);

  const tutorId = useMemo(() => {
    const tutor = userData.user?.role === IUser.Role.Tutor;
    if (!tutor) return;
    return userData.user?.id;
  }, [userData.user?.id, userData.user?.role]);

  const meta = useFindTutorMeta(tutorId);

  const setData: Context["set"] = useCallback(
    (payload) => {
      if (payload.token) setBearerToken(payload.token);
      setUserData((prev) => {
        const data: Data = {
          user: payload.user || prev.user,
          meta: payload.meta || prev.meta,
        };
        cache.save(CacheKey.User, data);
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
    setBearerToken(query.data.token);
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
      refetch: { user: query.refetch, meta: meta.refetch },
      set: setData,
      logout,
    };
  }, [
    userData.user,
    userData.meta,
    query.isLoading,
    query.isFetching,
    query.refetch,
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
