import { ISubscription } from "@litespace/types";
import { createContext, useContext } from "react";

export type Context = {
  info: ISubscription.Self | null;
  remainingMinutes: number;
  loading: boolean;
  isError: boolean;
  error: unknown | null;
  fetching: boolean;
};

export const SubscriptionContext = createContext<Context | null>(null);

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === null)
    throw new Error(`useSubscription must be used within its provider`);
  return context;
}
