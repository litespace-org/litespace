import { IFilter, ITopic, Void } from "@litespace/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useApi } from "@/api";
import { usePaginate } from "@/pagination";
import { MutationKey, QueryKey } from "@/constants";
import { useInfinitePaginationQuery } from "@/query";

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

export function usePaginatedTopics(
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

export function useInfiniteTopics() {
  const api = useApi();

  const findTopics = useCallback(
    async ({ page }: { page: number }) => {
      return await api.topic.findTopics({ page });
    },
    [api.topic]
  );

  return useInfinitePaginationQuery(findTopics, [QueryKey.FindTopics]);
}

export function useUserTopics() {
  const api = useApi();

  const findTopics = useCallback(async () => {
    return await api.topic.findUserTopics();
  }, [api.topic]);

  const keys = useMemo(() => [QueryKey.FindUserTopics], []);

  const query = useQuery({
    queryFn: findTopics,
    queryKey: keys,
  });

  return { query, keys };
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
