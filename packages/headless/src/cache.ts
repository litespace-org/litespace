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
  const api = useApi();

  const flushCache = useCallback(async () => {
    return await api.cache.flush();
  }, [api.cache]);

  return useMutation({
    mutationFn: flushCache,
    mutationKey: [MutationKey.FlushCache],
    onSuccess,
    onError,
  });
}
