import { useCallback } from "react";
import { useAtlas } from "@/atlas/index";
import { IUser } from "@litespace/types";
import { useMutation } from "@tanstack/react-query";

export type OnLoginSuccess = (response: IUser.LoginApiResponse) => void;
export type OnError = (error: Error) => void;

export function useLogin({
  onSuccess,
  onError,
}: {
  onSuccess: OnLoginSuccess;
  onError: OnError;
}) {
  const atlas = useAtlas();
  const login = useCallback(
    async (credentials: IUser.Credentials) => {
      return atlas.auth.password(credentials);
    },
    [atlas.auth]
  );

  return useMutation({
    onSuccess,
    onError,
    mutationFn: login,
    mutationKey: ["login"],
  });
}
