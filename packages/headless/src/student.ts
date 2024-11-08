import { useAtlas } from "@/atlas";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useCallback } from "react";
import { QueryKey } from "@/constants";
import { IUser } from "@litespace/types";

export function useFindStudentStats(
  id: number
): UseQueryResult<IUser.FindStudentStatsApiResponse | null, Error> {
  const atlas = useAtlas();
  const findStats = useCallback(async () => {
    return await atlas.user.findStudentStats(id);
  }, [atlas.user, id]);
  return useQuery({
    queryFn: findStats,
    queryKey: [QueryKey.FindStudentStats, id],
  });
}
