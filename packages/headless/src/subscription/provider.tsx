import React, { useMemo } from "react";
import { SubscriptionContext, Context } from "@/subscription/context";
import { useCurrentSubscription } from "@/subscription";
import { useServer } from "@/server";
import { useUserContext } from "@/user/context";
import { isStudent } from "@litespace/utils";

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { canPerformPrivateRequests } = useServer();
  const { user } = useUserContext();

  const { query } = useCurrentSubscription({
    enabled: canPerformPrivateRequests && isStudent(user),
    userId: user?.id,
  });

  const context = useMemo((): Context => {
    return {
      info: query.data?.info || null,
      remainingWeeklyMinutes: query.data?.remainingWeeklyMinutes || 0,
      loading: query.isLoading,
      isError: query.isError,
      error: query.error,
      fetching: query.isFetching,
    };
  }, [
    query.data?.info,
    query.data?.remainingWeeklyMinutes,
    query.isLoading,
    query.isError,
    query.error,
    query.isFetching,
  ]);

  return (
    <SubscriptionContext.Provider value={context}>
      {children}
    </SubscriptionContext.Provider>
  );
};
