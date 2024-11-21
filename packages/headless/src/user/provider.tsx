import React, { useCallback, useEffect, useMemo, useState } from "react";
import { UserContext, Context } from "@/user/context";
import { useCurrentUser } from "@/user";
import { cache } from "@/cache/base";
import { CacheKey } from "@/constants/cache";
import { ITutor, IUser } from "@litespace/types";
import { useTutorMeta } from "@/tutor";

type Data = {
  user: IUser.Self | null;
  meta: ITutor.Self | null;
  token: string | null;
};

const defaultData: Data = {
  user: null,
  meta: null,
  token: null,
};

const userCache = cache.load<Data>(CacheKey.User);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userData, setUserData] = useState<Data>(userCache || defaultData);

  const query = useCurrentUser(!!userData.token);

  const tutorId = useMemo(() => {
    const tutor = userData.user?.role === IUser.Role.Tutor;
    if (!tutor) return;
    return userData.user?.id;
  }, [userData.user?.id, userData.user?.role]);

  const meta = useTutorMeta(tutorId);

  const setData: Context["set"] = useCallback((payload) => {
    setUserData((prev) => {
      const data: Data = { ...prev, ...payload };
      cache.save(CacheKey.User, data);
      return data;
    });
  }, []);

  const logout = useCallback(() => {
    cache.remove(CacheKey.User);
    setUserData(defaultData);
  }, []);

  useEffect(() => {
    if (!query.data || query.isLoading || query.isFetching) return;
    return setData({ ...query.data });
  }, [query.data, query.isFetching, query.isLoading, setData]);

  const context = useMemo((): Context => {
    return {
      user: userData.user,
      meta: userData.meta,
      token: userData.token,
      loading: query.isLoading,
      fetching: query.isFetching,
      refetch: { user: query.refetch, meta: meta.refetch },
      set: setData,
      logout,
    };
  }, [
    userData.user,
    userData.meta,
    userData.token,
    query.isLoading,
    query.isFetching,
    query.refetch,
    meta.refetch,
    setData,
    logout,
  ]);

  return (
    <UserContext.Provider value={context}>{children}</UserContext.Provider>
  );
};
