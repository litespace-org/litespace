import { useApi } from "@/api/index";
import { useCallback, useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MutationKey, QueryKey } from "@/constants";
import { OnError, OnSuccess } from "@/types/query";
import { IIntroVideo } from "@litespace/types";

export function useFindLastIntroVideo(tutorId: number) {
  const api = useApi();

  const findQuery = useCallback(async () => {
    return api.introVideo.find({ tutorIds: [tutorId] });
  }, [api.introVideo, tutorId]);

  const query = useQuery({
    queryKey: [QueryKey.FindLastIntroVideo],
    queryFn: findQuery,
  });

  return query;
}

export function useCreateIntroVideo({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess<IIntroVideo.CreateApiResponse>;
  onError?: OnError;
}) {
  const api = useApi();
  const [progress, setProgress] = useState<number>(0);
  const abortController = useRef(new AbortController());

  const createIntroVideo = useCallback(
    async (
      payload: IIntroVideo.CreateApiPayload & IIntroVideo.CreateApiFiles
    ) => {
      return api.introVideo.create({
        ...payload,
        onUploadProgress(event) {
          const total = event.total;
          if (!total) return setProgress(0);
          const progress = Math.round((event.loaded * 100) / total);
          setProgress(progress);
        },
        abortSignal: abortController.current.signal,
      });
    },
    [api.introVideo]
  );

  const mutation = useMutation({
    mutationFn: createIntroVideo,
    onSuccess,
    onMutate() {
      abortController.current = new AbortController();
    },
    onError,
    mutationKey: [MutationKey.CreateIntroVideo],
  });

  return {
    mutation,
    progress,
    abort: () => abortController.current.abort(),
  };
}
