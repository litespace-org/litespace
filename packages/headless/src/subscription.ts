import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useApi } from "@/api";
import { QueryKey } from "@/constants";

export function useCurrentSubscription(config?: { enabled?: boolean }) {
  const api = useApi();

  const findCurrentSubscription = useCallback(async () => {
    return api.subscription.findCurrentSubscription();
  }, [api.subscription]);

  const keys = useMemo(() => [QueryKey.FindCurrentSubscription], []);

  const query = useQuery({
    queryFn: findCurrentSubscription,
    queryKey: keys,
    enabled: config?.enabled,
  });

  return { query, keys };
}
