import { useApi } from "@/api/context";
import { IPlan, Void } from "@litespace/types";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { useCallback } from "react";

export function usePlans(): UseQueryResult<IPlan.Self[], Error> {
  const api = useApi();
  const findPlans = useCallback(() => api.plan.find(), [api.plan]);
  return useQuery({
    queryFn: findPlans,
    queryKey: ["find-all-plans"],
  });
}

export function useCreatePlan({
  onSuccess,
  onError,
}: {
  onSuccess?(): void;
  onError?(error: Error): void;
}) {
  const api = useApi();
  const createPlan = useCallback(
    (payload: IPlan.CreateApiPayload) => api.plan.create(payload),
    [api.plan]
  );
  return useMutation({
    mutationFn: createPlan,
    mutationKey: ["create-plan"],
    onSuccess,
    onError,
  });
}

export function useUpdatePlan({
  onSuccess,
  onError,
}: {
  onSuccess?: Void;
  onError?(error: Error): void;
}) {
  const api = useApi();
  const updatePlan = useCallback(
    ({ id, payload }: { id: number; payload: IPlan.UpdateApiPayload }) =>
      api.plan.update(id, payload),
    [api.plan]
  );

  return useMutation({
    mutationFn: updatePlan,
    mutationKey: ["update-plan"],
    onSuccess,
    onError,
  });
}

export function useDeletePlan({
  onSuccess,
  onError,
}: {
  onSuccess?: Void;
  onError?: (error: Error) => void;
}) {
  const api = useApi();
  const deletePlan = useCallback(
    (id: number) => api.plan.delete(id),
    [api.plan]
  );

  return useMutation({
    mutationFn: deletePlan,
    mutationKey: ["delete-plan"],
    onSuccess,
    onError,
  });
}
