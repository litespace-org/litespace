import { ITopic, IUser } from "@litespace/types";
import { useApi } from "@/api";
import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MutationKey, QueryKey } from "@/constants";
import { BaseMutationPayload, OnError, OnSuccess } from "@/types/query";

export function useLoginUser(
  payload?: BaseMutationPayload<IUser.LoginApiResponse>
) {
  const atlas = useApi();
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
  const atlas = useApi();

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
  onSuccess?: OnSuccess<IUser.Self>;
  onError?: OnError;
}) {
  const atlas = useApi();

  const update = useCallback(
    async ({ id, payload }: { id: number; payload: IUser.UpdateApiPayload }) =>
      atlas.user.update(id, payload),
    [atlas.user]
  );

  return useMutation({
    mutationFn: update,
    mutationKey: [MutationKey.UpdateUserPersonalInfo],
    onSuccess,
    onError,
  });
}

export function useUpdateUserTopics({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess<void>;
  onError?: OnError;
}) {
  const atlas = useApi();

  const update = useCallback(
    async (payload: ITopic.ReplaceUserTopicsApiPayload) =>
      await atlas.topic.replaceUserTopics(payload),
    [atlas.topic]
  );

  return useMutation({
    mutationFn: update,
    mutationKey: [MutationKey.UpdateTutorTopics],
    onSuccess,
    onError,
  });
}

export function useUpdateFullTutor({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess<void>;
  onError: OnError;
}) {
  const atlas = useApi();

  const update = useCallback(
    async ({
      id,
      payload,
    }: {
      id: number;
      payload: ITopic.ReplaceUserTopicsApiPayload & IUser.UpdateApiPayload;
    }) => {
      await Promise.all([
        atlas.topic.replaceUserTopics(payload),
        atlas.user.update(id, payload),
      ]);
    },
    [atlas]
  );

  return useMutation({
    mutationFn: update,
    mutationKey: [MutationKey.UpdateFullTutor],
    onSuccess,
    onError,
  });
}

export function useCurrentUser(enabled: boolean = true) {
  const atlas = useApi();

  const findCurrentUser = useCallback(() => {
    return atlas.user.findCurrentUser();
  }, [atlas.user]);

  return useQuery({
    queryKey: [QueryKey.FindCurrentUser],
    queryFn: findCurrentUser,
    enabled,
  });
}

export function useUploadUserImage({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess<void>;
  onError?: OnError;
}) {
  const atlas = useApi();
  const [progress, setProgress] = useState<number>(0);

  const upload = useCallback(
    (payload: { forUser?: number; image: File }) =>
      atlas.user.uploadUserImage({
        ...payload,
        onUploadProgress(event) {
          const total = event.total;
          if (!total) return setProgress(0);
          const progress = Math.round((event.loaded * 100) / total);
          setProgress(progress);
        },
      }),
    [atlas.user]
  );

  const muation = useMutation({
    mutationFn: upload,
    mutationKey: [MutationKey.UploadUserAssets],
    onSuccess,
    onError,
  });

  return { muation, progress };
}

export type UploadTutorAssetsPayload = {
  tutorId: number;
  image?: File;
  video?: File;
  thumbnail?: File;
};

export function useUploadTutorAssets({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess<void>;
  onError?: OnError;
}) {
  const atlas = useApi();
  const [progress, setProgress] = useState<number>(0);
  const abortController = useRef(new AbortController());

  const upload = useCallback(
    (payload: UploadTutorAssetsPayload) =>
      atlas.user.uploadTutorAssets({
        ...payload,
        onUploadProgress(event) {
          const total = event.total;
          if (!total) return setProgress(0);
          const progress = Math.round((event.loaded * 100) / total);
          setProgress(progress);
        },
        abortSignal: abortController.current.signal,
      }),
    [atlas.user]
  );

  const mutation = useMutation({
    mutationFn: upload,
    mutationKey: [MutationKey.UploadUserAssets, abortController],
    onMutate() {
      abortController.current = new AbortController();
    },
    onSuccess,
    onError,
  });

  return {
    mutation,
    progress,
    abort: () => abortController.current.abort(),
  };
}
