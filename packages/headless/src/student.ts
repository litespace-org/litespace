import { useApi } from "@/api";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { MutationKey, QueryKey } from "@/constants";
import { IStudent, IUser } from "@litespace/types";
import { OnError, OnSuccess } from "@/types/query";

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

export function useCreateStudent({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess<IStudent.CreateApiResponse>;
  onError?: OnError;
}) {
  const api = useApi();

  const create = useCallback(
    async (payload: IStudent.CreateApiPayload) => {
      return api.student.create(payload);
    },
    [api.student]
  );

  return useMutation({
    mutationFn: create,
    onSuccess,
    onError,
  });
}

export function useUpdateStudent({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess<IStudent.UpdateApiResponse>;
  onError?: OnError;
}) {
  const api = useApi();

  const update = useCallback(
    async ({
      id,
      payload,
    }: {
      id: number;
      payload: IStudent.UpdateApiPayload;
    }) => api.student.update(id, payload),
    [api.student]
  );

  return useMutation({
    mutationFn: update,
    mutationKey: [MutationKey.UpdateStudent],
    onSuccess,
    onError,
  });
}
