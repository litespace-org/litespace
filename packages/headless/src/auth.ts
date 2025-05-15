import { useCallback } from "react";
import { useApi } from "@/api/index";
import { IUser } from "@litespace/types";
import { useMutation } from "@tanstack/react-query";
import { MutationKey } from "@/constants";
import { OnSuccess } from "@/types/query";

export function useRefreshAuthToken({
  onSuccess,
}: {
  onSuccess?: OnSuccess<IUser.RefreshAuthTokenApiResponse>;
}) {
  const api = useApi();
  const refresh = useCallback(() => api.auth.refreshToken(), [api.auth]);

  return useMutation({
    mutationFn: refresh,
    mutationKey: [MutationKey.RefreshAuthToken],
    onSuccess,
  });
}
