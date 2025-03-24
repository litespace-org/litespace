import { useApi } from "@/api/index";
import { Void } from "@litespace/types";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { MutationKey } from "@/constants";

export function useFlushCache({
  onSuccess,
  onError,
}: {
  onSuccess?: Void;
  onError?(error: Error): void;
}) {
  const atlas = useApi();

  const flushCache = useCallback(async () => {
    return await atlas.cache.flush();
  }, [atlas.cache]);

  return useMutation({
    mutationFn: flushCache,
    mutationKey: [MutationKey.FlushCache],
    onSuccess,
    onError,
  });
}
