import { ILesson, ISubscription, Void } from "@litespace/types";
import { createContext, useContext } from "react";

export type Context = {
  info: ISubscription.Self | null;
  remainingWeeklyMinutes: number;
  paidLessonStatus: ILesson.PaidLessonStatus;
  loading: boolean;
  isError: boolean;
  error: unknown | null;
  fetching: boolean;
  refetch: Void;
};

export const SubscriptionContext = createContext<Context | null>(null);

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === null)
    throw new Error(`useSubscription must be used within its provider`);
  return context;
}
