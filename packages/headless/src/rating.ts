import { IFilter, IRating, Void } from "@litespace/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { MutationKey, QueryKey } from "@/constants";
import { useAtlas } from "@/atlas";
import { OnError } from "@/types/query";

export type OnSuccess = Void;

export function useFindTutorRatings(
  id: number | null,
  pagination: IFilter.Pagination
) {
  const atlas = useAtlas();
  const findRateeRatings = useCallback(async () => {
    if (!id) return { list: [], total: 0 };
    return atlas.rating.findTutorRatings(id, pagination);
  }, [atlas.rating, id, pagination]);

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
  const atlas = useAtlas();
  const rate = useCallback(
    async (payload: IRating.CreateApiPayload) => {
      return atlas.rating.create(payload);
    },
    [atlas.rating]
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
  const atlas = useAtlas();
  const editRate = useCallback(
    async ({
      id,
      payload,
    }: {
      id: number;
      payload: IRating.UpdateApiPayload;
    }) => {
      return atlas.rating.update(id, payload);
    },
    [atlas.rating]
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
  const atlas = useAtlas();
  const deleteRate = useCallback(
    async (id: number) => {
      return atlas.rating.delete(id);
    },
    [atlas.rating]
  );

  return useMutation({
    onSuccess,
    onError,
    mutationFn: deleteRate,
    mutationKey: [MutationKey.DeleteRating],
  });
}
