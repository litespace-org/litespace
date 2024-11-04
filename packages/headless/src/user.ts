import { ITutor, IUser, Void } from "@litespace/types";
import { useAtlas } from "@/atlas";
import { useCallback } from "react";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { QueryKey } from "./constants";

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
    [dispatchFn]
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

  const createUser = useCallback(async (payload: IUser.CreateApiPayload) => {
    return atlas.user.create(payload);
  }, []);

  return useMutation({
    mutationFn: createUser,
    onSuccess,
    onError,
  });
}

export function useFindTutorMeta(
  id?: number
): UseQueryResult<ITutor.FindTutorMetaApiResponse> {
  const atlas = useAtlas();
  const findTutorMeta = useCallback(async () => {
    if (!id) return null;
    return await atlas.user.findTutorMeta(id);
  }, [atlas.user]);

  return useQuery({
    queryFn: findTutorMeta,
    queryKey: [QueryKey.FindTutorMeta, id],
    enabled: !!id,
  });
}
