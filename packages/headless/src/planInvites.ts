import { useApi } from "@/api/context";
import { IPlanInvites, Void } from "@litespace/types";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { MutationKey, QueryKey } from "@/constants";
import { usePaginate } from "@/pagination";

export function usePlanInvites(payload?: IPlanInvites.FindApiQuery) {
  const api = useApi();

  const findPlanInvites = useCallback(
    ({ page, size }: IPlanInvites.FindApiQuery) =>
      api.planInvite.find({ page, size, ...payload }),
    [api.planInvite, payload]
  );

  return usePaginate(findPlanInvites, [QueryKey.FindPlanInvites, payload]);
}

export function useCreatePlanInvite({
  onSuccess,
  onError,
}: {
  onSuccess?(): void;
  onError?(error: Error): void;
}) {
  const api = useApi();
  const createPlan = useCallback(
    (payload: IPlanInvites.CreateApiPayload) => api.planInvite.create(payload),
    [api.planInvite]
  );
  return useMutation({
    mutationFn: createPlan,
    mutationKey: [MutationKey.CreatePlanInvite],
    onSuccess,
    onError,
  });
}

export function useUpdatePlanInvite({
  onSuccess,
  onError,
}: {
  onSuccess?: Void;
  onError?(error: Error): void;
}) {
  const api = useApi();
  const updatePlan = useCallback(
    ({ payload }: { payload: IPlanInvites.UpdateApiPayload }) =>
      api.planInvite.update(payload),
    [api.planInvite]
  );

  return useMutation({
    mutationFn: updatePlan,
    mutationKey: [MutationKey.UpdatePlanInvite],
    onSuccess,
    onError,
  });
}

export function useDeletePlanInvite({
  onSuccess,
  onError,
}: {
  onSuccess?: Void;
  onError?: (error: Error) => void;
}) {
  const api = useApi();
  const deletePlan = useCallback(
    (id: number) => api.planInvite.delete(id),
    [api.planInvite]
  );

  return useMutation({
    mutationFn: deletePlan,
    mutationKey: [MutationKey.DeletePlanInvite],
    onSuccess,
    onError,
  });
}
