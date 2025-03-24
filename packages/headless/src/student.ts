import { useApi } from "@/api";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useCallback } from "react";
import { QueryKey } from "@/constants";
import { IUser } from "@litespace/types";

export function useFindStudentStats(
  id?: number
): UseQueryResult<IUser.FindStudentStatsApiResponse | null, Error> {
  const atlas = useApi();

  const findStats = useCallback(async () => {
    if (!id) return null;
    return await atlas.user.findStudentStats(id);
  }, [atlas.user, id]);

  return useQuery({
    queryFn: findStats,
    queryKey: [QueryKey.FindStudentStats, id],
    enabled: !!id,
  });
}

export function useFindPersonalizedStudentStats() {
  const atlas = useApi();

  const findStats = useCallback(async () => {
    return await atlas.user.findPersonalizedStudentStats();
  }, [atlas.user]);

  return useQuery({
    queryFn: findStats,
    queryKey: [QueryKey.FindPersonalizedStudentStats],
  });
}
