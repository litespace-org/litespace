import { useApi } from "@/api/context";
import { IPlan, Void } from "@litespace/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { QueryKey } from "@/constants";

const FIND_PLANS_QUERY_KEY = [QueryKey.FindPlans];

export function usePlans() {
  const api = useApi();
  const findPlans = useCallback(() => api.plan.find(), [api.plan]);
  const query = useQuery({
    queryFn: findPlans,
    queryKey: FIND_PLANS_QUERY_KEY,
  });

  return { query, keys: FIND_PLANS_QUERY_KEY };
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

export function useFindPlanById(id: number) {
  const api = useApi();
  const keys = useMemo(() => [QueryKey.FindPlanById, id], [id]);
  const findById = useCallback(() => api.plan.findById(id), [api.plan, id]);

  const query = useQuery({
    queryFn: findById,
    queryKey: keys,
  });

  return { query, keys };
}
