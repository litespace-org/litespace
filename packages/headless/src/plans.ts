import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { useAtlas } from "@/atlas/context";
import { useCallback } from "react";
import { IPlan } from "@litespace/types";

export function usePlans(): UseQueryResult<IPlan.MappedAttributes[], Error> {
  const atlas = useAtlas();
  const findPlans = useCallback(() => atlas.plan.findAll(), [atlas.plan]);
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
