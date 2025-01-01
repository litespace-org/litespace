import { ITopic, Void } from "@litespace/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAtlas } from "@/atlas";
import { usePaginate } from "@/pagination";
import { MutationKey, QueryKey } from "@/constants";

type OnSuccess = Void;
type OnError = (error: Error) => void;

export function useCreateTopic({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const atlas = useAtlas();

  const createTopic = useCallback(
    async (payload: ITopic.CreateApiPayload) => {
      return atlas.topic.create(payload);
    },
    [atlas.topic]
  );

  return useMutation({
    mutationFn: createTopic,
    mutationKey: [MutationKey.CreateTopic],
    onSuccess,
    onError,
  });
}

export function useTopics(query: ITopic.FindTopicsApiQuery) {
  const atlas = useAtlas();

  const findTopics = useCallback(async () => {
    return await atlas.topic.findTopics(query);
  }, [atlas.topic, query]);

  return usePaginate(findTopics, [QueryKey.FindTopic, query]);
}

export function useUserTopics() {
  const atlas = useAtlas();

  const findTopics = useCallback(async () => {
    return await atlas.topic.findUserTopics();
  }, [atlas.topic]);

  return useQuery({
    queryFn: findTopics,
    queryKey: [QueryKey.FindUserTopics],
  });
}

export function useUpdateTopic({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const atlas = useAtlas();

  const updateTopic = useCallback(
    async ({
      id,
      payload,
    }: {
      id: number;
      payload: ITopic.UpdateApiPayload;
    }) => {
      return atlas.topic.updateTopic(id, payload);
    },
    [atlas.topic]
  );

  return useMutation({
    mutationFn: updateTopic,
    mutationKey: [MutationKey.UpdateTopic],
    onSuccess,
    onError,
  });
}

export function useDeleteTopic({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const atlas = useAtlas();

  const deleteTopic = useCallback(
    async ({ id }: { id: number }) => {
      return atlas.topic.deleteTopic(id);
    },
    [atlas.topic]
  );

  return useMutation({
    mutationFn: deleteTopic,
    mutationKey: [MutationKey.DeleteTopic],
    onSuccess,
    onError,
  });
}
