import { useApi } from "@/api";
import { MutationKey, QueryKey } from "@/constants";
import { OnError } from "@/types/query";
import { IDemoSession, Void } from "@litespace/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

type OnSuccess = Void;

export function useFindLastDemoSession(tutorId: number) {
  const api = useApi();

  const findQuery = useCallback(async () => {
    return api.demoSession.find({
      tutorIds: [tutorId],
      statuses: [IDemoSession.Status.Pending, IDemoSession.Status.Passed],
    });
  }, [api.demoSession, tutorId]);

  const keys = useMemo(() => [MutationKey.FindLastDemoSession], []);

  const query = useQuery({
    queryKey: [QueryKey.FindLastDemoSession],
    queryFn: findQuery,
  });

  return { query, keys };
}

export function useCreateDemoSession({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const api = useApi();

  const createDemoSession = useCallback(
    async (payload: IDemoSession.CreateApiPayload) => {
      return api.demoSession.create(payload);
    },
    [api.demoSession]
  );

  return useMutation({
    mutationFn: createDemoSession,
    mutationKey: [MutationKey.CreateDemoSession],
    onSuccess,
    onError,
  });
}

export function useCancelDemoSession({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const api = useApi();

  const cancel = useCallback(
    async ({ id, status }: IDemoSession.UpdateApiPayload) => {
      return api.demoSession.update({
        id,
        status,
      });
    },
    [api.demoSession]
  );

  return useMutation({
    mutationFn: cancel,
    mutationKey: [MutationKey.CancelDemoSession],
    onSuccess,
    onError,
  });
}
