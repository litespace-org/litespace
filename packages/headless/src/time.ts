import { useApi } from "@/api";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useCallback } from "react";
import { QueryKey } from "@/constants";

export function useCurrentZoneTime(
  timezone: string
): UseQueryResult<
  { iso: string; hour: number; minute: number; second: number },
  Error
> {
  const api = useApi();

  const findStats = useCallback(async () => {
    return await api.time.currentZoneTime(timezone);
  }, [api.time, timezone]);

  return useQuery({
    queryFn: findStats,
    queryKey: [QueryKey.GetCurrentTZHour, timezone],
    enabled: !!timezone,
  });
}
