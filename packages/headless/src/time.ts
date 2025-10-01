import { useApi } from "@/api";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useCallback } from "react";
import { QueryKey } from "@/constants";

export function useCurrentTZHour(
  timezone: string
): UseQueryResult<{ hour: number }, Error> {
  const api = useApi();

  const findStats = useCallback(async () => {
    return await api.time.currentHour(timezone);
  }, [api.time, timezone]);

  return useQuery({
    queryFn: findStats,
    queryKey: [QueryKey.GetCurrentTZHour, timezone],
    enabled: !!timezone,
  });
}
