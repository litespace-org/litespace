import { useCallback } from "react";
import { useApi } from "@/api/index";
import { IUser } from "@litespace/types";
import { useMutation } from "@tanstack/react-query";
import { MutationKey } from "@/constants";
import { OnSuccess, OnError } from "@/types/query";

export function useRefreshAuthToken({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess<IUser.RefreshAuthTokenApiResponse>;
  onError?: OnError;
}) {
  const api = useApi();

  const refresh = useCallback(() => api.auth.refreshToken(), [api.auth]);

  return useMutation({
    mutationFn: refresh,
    mutationKey: [MutationKey.RefreshAuthToken],
    onSuccess,
    onError,
  });
}
