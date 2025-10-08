import React, { useMemo } from "react";
import { SubscriptionContext, Context } from "@/subscription/context";
import { useCurrentSubscription } from "@/subscription";
import { useServer } from "@/server";
import { useUser } from "@/user/context";
import { isStudent } from "@litespace/utils";
import { ILesson } from "@litespace/types";

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { canPerformPrivateRequests } = useServer();
  const { user } = useUser();

  const { query } = useCurrentSubscription({
    enabled: canPerformPrivateRequests && isStudent(user),
    userId: user?.id,
  });

  const context = useMemo((): Context => {
    return {
      info: query.data?.info || null,
      remainingWeeklyMinutes: query.data?.remainingWeeklyMinutes || 0,
      paidLessonStatus:
        query.data?.paidLessonStatus || ILesson.PaidLessonStatus.NotEligible,
      hasPendingPaidLeson: query.data?.hasPendingPaidLesson || false,
      loading: query.isLoading,
      isError: query.isError,
      error: query.error,
      fetching: query.isFetching,
      refetch: query.refetch,
    };
  }, [
    query.data?.info,
    query.data?.remainingWeeklyMinutes,
    query.data?.paidLessonStatus,
    query.data?.hasPendingPaidLesson,
    query.isLoading,
    query.isError,
    query.error,
    query.isFetching,
    query.refetch,
  ]);

  return (
    <SubscriptionContext.Provider value={context}>
      {children}
    </SubscriptionContext.Provider>
  );
};
