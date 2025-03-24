import { IAvailabilitySlot } from "@litespace/types";
import { useApi } from "@/api";
import { useCallback } from "react";
import { MutationKey, QueryKey } from "@/constants";
import { useMutation, useQuery } from "@tanstack/react-query";
import { OnError, OnSuccess } from "@/types/query";
import { ResponseError } from "@litespace/utils";

export function useFindAvailabilitySlots(
  query: IAvailabilitySlot.FindAvailabilitySlotsApiQuery
) {
  const atlas = useApi();

  const findSlots = useCallback(
    () => atlas.availabilitySlot.find(query),
    [atlas.availabilitySlot, query]
  );

  return useQuery({
    queryFn: findSlots,
    queryKey: [QueryKey.FindAvailabilitySlots, query],
  });
}

export function useSetAvailabilitySlots({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess<void>;
  onError: OnError;
}) {
  const atlas = useApi();

  const deleteSlot = useCallback(
    (actions: IAvailabilitySlot.Action[]) => {
      return atlas.availabilitySlot.set({ actions });
    },
    [atlas.availabilitySlot]
  );

  return useMutation<void, ResponseError, IAvailabilitySlot.Action[]>({
    mutationFn: deleteSlot,
    mutationKey: [MutationKey.DeleteSlot],
    onSuccess,
    onError,
  });
}
