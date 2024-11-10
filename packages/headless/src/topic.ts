import { ITopic, Void } from "@litespace/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAtlas } from "@/atlas";

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
    mutationKey: ["create-topic"],
    onSuccess,
    onError,
  });
}

export function useTopics(params: ITopic.FindTopicsApiQuery) {
  const atlas = useAtlas();
  const findTopics = useCallback(async () => {
    return atlas.topic.findTopics(params);
  }, [atlas.topic, params]);

  return useQuery({
    queryFn: findTopics,
    queryKey: ["find-topics"],
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
    mutationKey: ["update-topic"],
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
    mutationKey: ["delete-topic"],
    onSuccess,
    onError,
  });
}
