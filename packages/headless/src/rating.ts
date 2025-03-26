import { IFilter, IRating, Void } from "@litespace/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { MutationKey, QueryKey } from "@/constants";
import { useApi } from "@/api";
import { OnError } from "@/types/query";

export type OnSuccess = Void;

export function useFindTutorRatings(
  id: number | null,
  pagination: IFilter.Pagination
) {
  const api = useApi();
  const findRateeRatings = useCallback(async () => {
    if (!id) return { list: [], total: 0 };
    return api.rating.findTutorRatings(id, pagination);
  }, [api.rating, id, pagination]);

  return useQuery({
    queryKey: [QueryKey.FindTutorRating, id],
    queryFn: findRateeRatings,
    enabled: !!id,
    retry: false,
  });
}

export function useCreateRatingTutor({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const api = useApi();
  const rate = useCallback(
    async (payload: IRating.CreateApiPayload) => {
      return api.rating.create(payload);
    },
    [api.rating]
  );

  return useMutation({
    onSuccess,
    onError,
    mutationFn: rate,
    mutationKey: [MutationKey.CreateRating],
  });
}

export function useEditRatingTutor({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const api = useApi();
  const editRate = useCallback(
    async ({
      id,
      payload,
    }: {
      id: number;
      payload: IRating.UpdateApiPayload;
    }) => {
      return api.rating.update(id, payload);
    },
    [api.rating]
  );

  return useMutation({
    onSuccess,
    onError,
    mutationFn: editRate,
    mutationKey: [MutationKey.EditRating],
  });
}

export function useDeleteRatingTutor({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const api = useApi();
  const deleteRate = useCallback(
    async (id: number) => {
      return api.rating.delete(id);
    },
    [api.rating]
  );

  return useMutation({
    onSuccess,
    onError,
    mutationFn: deleteRate,
    mutationKey: [MutationKey.DeleteRating],
  });
}
