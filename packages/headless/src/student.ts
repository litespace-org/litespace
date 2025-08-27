import { useApi } from "@/api";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { QueryKey } from "@/constants";
import { IUser, IStudent } from "@litespace/types";
import { usePaginate } from "@/pagination";

export function useStudents(payload?: IStudent.FindModelQuery) {
  const api = useApi();

  const findStudents = useCallback(
    ({ page, size }: IStudent.FindModelQuery) =>
      api.student.find({ page, size, ...payload }),
    [api.student, payload]
  );

  return usePaginate(findStudents, [QueryKey.FindStudents, payload]);
}

export function useFindStudentStats(
  id?: number
): UseQueryResult<IUser.FindStudentStatsApiResponse | null, Error> {
  const api = useApi();

  const findStats = useCallback(async () => {
    if (!id) return null;
    return await api.user.findStudentStats(id);
  }, [api.user, id]);

  return useQuery({
    queryFn: findStats,
    queryKey: [QueryKey.FindStudentStats, id],
    enabled: !!id,
  });
}

export function useFindPersonalizedStudentStats() {
  const api = useApi();

  const findStats = useCallback(async () => {
    return await api.user.findPersonalizedStudentStats();
  }, [api.user]);

  const keys = useMemo(() => [QueryKey.FindPersonalizedStudentStats], []);

  const query = useQuery({
    queryFn: findStats,
    queryKey: [QueryKey.FindPersonalizedStudentStats],
  });

  return { query, keys };
}
