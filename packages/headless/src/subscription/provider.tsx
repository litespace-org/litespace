import React, { useEffect, useMemo, useState } from "react";
import { SubscriptionContext, Context } from "@/subscription/context";
import { ISubscription } from "@litespace/types";
import { useCurrentSubscription } from "@/subscription";
import { useServer } from "@/server";

type Data = ISubscription.FindCurrentApiResponse;

const defaultData: Data = {
  info: null,
  remainingWeeklyMinutes: 0,
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<Data>(defaultData);
  const { canPerformPrivateRequests } = useServer();

  const { query } = useCurrentSubscription({
    enabled: canPerformPrivateRequests,
  });

  useEffect(() => {
    if (!query.data || query.isLoading || query.isFetching) return;
    setData(query.data);
  }, [query.data, query.isFetching, query.isLoading, setData]);

  const context = useMemo((): Context => {
    return {
      subscription: data.info,
      remainingMinutes: data.remainingWeeklyMinutes,
      loading: query.isLoading,
      isError: query.isError,
      error: query.error,
      fetching: query.isFetching,
    };
  }, [
    data.info,
    data.remainingWeeklyMinutes,
    query.isLoading,
    query.isFetching,
    query.isError,
    query.error,
  ]);

  return (
    <SubscriptionContext.Provider value={context}>
      {children}
    </SubscriptionContext.Provider>
  );
};
