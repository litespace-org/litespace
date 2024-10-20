import { useAtlas } from "@/atlas/context";
import { IPlan, Void } from "@litespace/types";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { useCallback } from "react";

export function usePlans(): UseQueryResult<IPlan.MappedAttributes[], Error> {
  const atlas = useAtlas();
  const findPlans = useCallback(() => atlas.plan.find(), [atlas.plan]);
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
  const atlas = useAtlas();
  const createPlan = useCallback(
    (payload: IPlan.CreateApiPayload) => atlas.plan.create(payload),
    [atlas.plan]
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
  const atlas = useAtlas();
  const updatePlan = useCallback(
    ({ id, payload }: { id: number; payload: IPlan.UpdateApiPayload }) =>
      atlas.plan.update(id, payload),
    [atlas.plan]
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
  const atlas = useAtlas();
  const deletePlan = useCallback(
    (id: number) => atlas.plan.delete(id),
    [atlas.plan]
  );

  return useMutation({
    mutationFn: deletePlan,
    mutationKey: ["delete-plan"],
    onSuccess,
    onError,
  });
}
