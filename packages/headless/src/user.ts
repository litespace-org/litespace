import { ITopic, IUser } from "@litespace/types";
import { useAtlas } from "@/atlas";
import { useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MutationKey, QueryKey } from "@/constants";
import { BaseMutationPayload, OnError, OnSuccess } from "@/types/query";
import { isEmpty } from "lodash";

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

/**
 * Update all user data in one mutation.
 */
export function useUpdateUser({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess<void>;
  onError?: OnError;
}) {
  const atlas = useAtlas();
  const update = useCallback(
    async ({
      id,
      payload,
    }: {
      id: number;
      payload: IUser.UpdateApiPayload & ITopic.ReplaceUserTopicsApiPayload;
    }) => {
      // TODO: Handle Updating profile Pictures here
      await Promise.all([
        atlas.user.update(id, payload),
        !isEmpty(payload.addTopics) || !isEmpty(payload.removeTopics)
          ? atlas.topic.replaceUserTopics(payload)
          : Promise.resolve(null),
      ]);
    },
    [atlas.user, atlas.topic]
  );

  return useMutation({
    mutationFn: update,
    mutationKey: [MutationKey.UpdateUser],
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
