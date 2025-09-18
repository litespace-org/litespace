import { useQuery } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { useApi } from "@/api";
import { QueryKey } from "@/constants";
import { ISubscription } from "@litespace/types";
import {
  isPseudoSubscription,
  getCurrentWeekBoundaries,
  getPseudoWeekBoundaries,
} from "@litespace/utils/subscription";
import { dayjs } from "@litespace/utils";

/**
 * Retrieve the last valid unterminated nor ended subscription for a specific userId
 */
export function useCurrentSubscription({
  userId,
  enabled,
}: {
  enabled?: boolean;
  userId?: number;
}) {
  const api = useApi();

  const findCurrentSubscription = useCallback(async () => {
    if (!userId) return null;
    return api.subscription.findUserSubscription({ userId });
  }, [api.subscription, userId]);

  const keys = [QueryKey.FindCurrentSubscription];

  const query = useQuery({
    queryFn: findCurrentSubscription,
    queryKey: keys,
    enabled,
  });

  return { query, keys };
}

export function useSubscriptionWeekBoundaries(sub?: ISubscription.Self | null) {
  return useMemo(() => {
    const boundaries =
      sub && !isPseudoSubscription(sub)
        ? getCurrentWeekBoundaries(sub.start)
        : getPseudoWeekBoundaries();

    return {
      start: dayjs(boundaries.start),
      end: dayjs(boundaries.end),
    };
  }, [sub]);
}
