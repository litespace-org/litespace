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
