import { IRating, Void } from "@litespace/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { QueryKey } from "@/constants";
import { useAtlas } from "@/atlas";

export type OnSuccess = Void;
export type OnError = (error: Error) => void;

export function useFindTutorRatings(id: number | null) {
  const atlas = useAtlas();
  const findRateeRatings = useCallback(async () => {
    if (!id) return { list: [], total: 0 };
    return atlas.rating.findTutorRatings(id, { size: 30, page: 1 });
  }, [atlas.rating, id]);

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
    mutationKey: ["create-rate"],
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
    mutationKey: ["edit-rate"],
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
    mutationKey: ["delete-rate"],
  });
}
