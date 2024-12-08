import { IUser, Void } from "@litespace/types";
import { useAtlas } from "@/atlas";
import { useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { QueryKey } from "@/constants";
import { BaseMutationPayload } from "@/types/query";

type OnSuccess = Void;
type OnError = (error: Error) => void;

export function useLoginUser(
  payload?: BaseMutationPayload<IUser.LoginApiResponse>
) {
  const atlas = useAtlas();
  const login = useCallback(
    async (credentials: IUser.Credentials) => {
      return await atlas.auth.password(credentials);
    },
    [atlas.auth]
  );

  return useMutation({
    mutationFn: login,
    onSuccess: payload?.onSuccess,
    onError: payload?.onError,
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

export function useUpdateUser({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess;
  onError?: OnError;
}) {
  const atlas = useAtlas();
  const update = useCallback(
    async ({
      id,
      payload,
    }: {
      id: number;
      payload: IUser.UpdateApiPayload;
    }) => {
      return await atlas.user.update(id, payload);
    },
    [atlas.user]
  );

  return useMutation({
    mutationFn: update,
    mutationKey: ["update-user"],
    onSuccess,
    onError,
  });
}

export function useCurrentUser(enabled: boolean = true) {
  const atlas = useAtlas();

  const findCurrentUser = useCallback(() => {
    return atlas.user.findCurrentUser();
  }, [atlas.user]);

  return useQuery({
    queryKey: [QueryKey.FindCurrentUser],
    queryFn: findCurrentUser,
    enabled,
  });
}
