import { IAvailabilitySlot } from "@litespace/types";
import { useApi } from "@/api";
import { useCallback } from "react";
import { MutationKey, QueryKey } from "@/constants";
import { useMutation, useQuery } from "@tanstack/react-query";
import { OnError, OnSuccess } from "@/types/query";
import { ResponseError } from "@litespace/utils";

export function useFindAvailabilitySlots(
  apiQuery: IAvailabilitySlot.FindAvailabilitySlotsApiQuery
) {
  const api = useApi();

  const findSlots = useCallback(
    () => api.availabilitySlot.find(apiQuery),
    [api.availabilitySlot, apiQuery]
  );

  const keys = [QueryKey.FindAvailabilitySlots, apiQuery];

  const query = useQuery({
    queryFn: findSlots,
    queryKey: keys,
  });

  return { query, keys };
}

export function useSetAvailabilitySlots({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess<void>;
  onError: OnError;
}) {
  const api = useApi();

  const deleteSlot = useCallback(
    (actions: IAvailabilitySlot.Action[]) => {
      return api.availabilitySlot.set({ actions });
    },
    [api.availabilitySlot]
  );

  return useMutation<void, ResponseError, IAvailabilitySlot.Action[]>({
    mutationFn: deleteSlot,
    mutationKey: [MutationKey.DeleteSlot],
    onSuccess,
    onError,
  });
}
