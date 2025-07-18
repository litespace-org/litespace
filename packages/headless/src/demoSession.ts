import { useApi } from "@/api";
import { MutationKey } from "@/constants";
import { OnError } from "@/types/query";
import { IDemoSession, Void } from "@litespace/types";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

type OnSuccess = Void;

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
