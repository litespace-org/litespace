import { useAtlas } from "@/atlas/index";
import { IRating, Void } from "@litespace/types";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

export type OnSuccess = Void;
export type OnError = (error: Error) => void;
export function useRateTutor({
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

export function useEditRateTutor({
  id,
  onSuccess,
  onError,
}: {
  id: number;
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const atlas = useAtlas();
  const editRate = useCallback(
    async (payload: IRating.UpdateApiPayload) => {
      return atlas.rating.update(id, payload);
    },
    [atlas.rating, id]
  );

  return useMutation({
    onSuccess,
    onError,
    mutationFn: editRate,
    mutationKey: ["edit-rate", id],
  });
}
