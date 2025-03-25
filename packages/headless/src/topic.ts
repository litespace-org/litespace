import { IFilter, ITopic, Void } from "@litespace/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useApi } from "@/api";
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
  const api = useApi();

  const createTopic = useCallback(
    async (payload: ITopic.CreateApiPayload) => {
      return api.topic.create(payload);
    },
    [api.topic]
  );

  return useMutation({
    mutationFn: createTopic,
    mutationKey: [MutationKey.CreateTopic],
    onSuccess,
    onError,
  });
}

export function useTopics(
  query: Omit<ITopic.FindTopicsApiQuery, "page" | "size">
) {
  const api = useApi();

  const findTopics = useCallback(
    async (pagination: IFilter.Pagination) => {
      return await api.topic.findTopics({ ...pagination, ...query });
    },
    [api.topic, query]
  );

  return usePaginate(findTopics, [QueryKey.FindTopic, query]);
}

export function useUserTopics() {
  const api = useApi();

  const findTopics = useCallback(async () => {
    return await api.topic.findUserTopics();
  }, [api.topic]);

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
  const api = useApi();

  const updateTopic = useCallback(
    async ({
      id,
      payload,
    }: {
      id: number;
      payload: ITopic.UpdateApiPayload;
    }) => {
      return api.topic.updateTopic(id, payload);
    },
    [api.topic]
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
  const api = useApi();

  const deleteTopic = useCallback(
    async ({ id }: { id: number }) => {
      return api.topic.deleteTopic(id);
    },
    [api.topic]
  );

  return useMutation({
    mutationFn: deleteTopic,
    mutationKey: [MutationKey.DeleteTopic],
    onSuccess,
    onError,
  });
}
