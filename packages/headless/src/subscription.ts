import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useApi } from "@/api";
import { QueryKey } from "@/constants";

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
