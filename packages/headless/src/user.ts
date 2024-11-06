import { IUser, Void } from "@litespace/types";
import { useAtlas } from "@/atlas";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

type OnSuccess = Void;
type OnError = (error: Error) => void;

export function useLoginUser({
  dispatchFn,
  onSuccess,
  onError,
}: {
  dispatchFn: (profile: IUser.LoginApiResponse) => void;
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const atlas = useAtlas();
  const login = useCallback(
    async (credentials: IUser.Credentials) => {
      const profile = await atlas.auth.password(credentials);
      dispatchFn(profile);
    },
    [atlas.auth, dispatchFn]
  );

  return useMutation({
    mutationFn: login,
    onSuccess: onSuccess,
    onError: onError,
  });
}

export function useRegisterUser({
  onSuccess,
  onError,
}: {
  onSuccess: ({ user, token }: IUser.RegisterApiResponse) => Promise<void>;
  onError: OnError;
}) {
  const atlas = useAtlas();

  const createUser = useCallback(
    async (payload: IUser.CreateApiPayload) => {
      return atlas.user.create(payload);
    },
    [atlas.user]
  );

  return useMutation({
    mutationFn: createUser,
    onSuccess,
    onError,
  });
}
