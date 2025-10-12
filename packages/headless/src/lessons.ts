import { Element, IFilter, ILesson, ISession } from "@litespace/types";
import { useCallback } from "react";
import { useApi } from "@/api/index";
import { MutationKey, QueryKey } from "@/constants";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { UsePaginateResult, usePaginate } from "@/pagination";
import {
  InfiniteQueryHandler,
  useExtendedQuery,
  useInfinitePaginationQuery,
} from "@/query";
import { OnError, OnSuccess } from "@/types/query";

export function useFindLessons({
  userOnly,
  ...query
}: ILesson.FindLessonsApiQuery & { userOnly?: boolean }): UsePaginateResult<
  Element<ILesson.FindUserLessonsApiResponse["list"]>
> {
  const api = useApi();

  const findLessons = useCallback(
    async ({ page, size }: IFilter.Pagination) => {
      if (userOnly && !query.users?.length) return { list: [], total: 0 };
      return await api.lesson.findLessons({
        page,
        size,
        ...query,
      });
    },
    [api.lesson, query, userOnly]
  );

  return usePaginate(findLessons, [QueryKey.FindLessons, query]);
}

export function useFindRefundableLessons(): UseQueryResult<ILesson.FindRefundableLessonsApiResponse> {
  const api = useApi();

  const findRefundableLessons = useCallback(async () => {
    return await api.lesson.findRefundableLessons({});
  }, [api.lesson]);

  return useQuery({
    queryFn: findRefundableLessons,
    queryKey: [QueryKey.FindRefundableLessons],
  });
}

export function useFindLessonBySessionId(sessionId: ISession.Id) {
  const api = useApi();

  const findBySessionId = useCallback(
    async () => await api.lesson.findBySessionId(sessionId),
    [api.lesson, sessionId]
  );

  return useQuery({
    queryFn: findBySessionId,
    queryKey: [QueryKey.FindLessonBySessionId, sessionId],
  });
}

/**
 * Paginate lessons using infinite pagination.
 */
export function useInfiniteLessons({
  userOnly,
  ...query
}: ILesson.FindLessonsApiQuery & { userOnly?: boolean }) {
  const api = useApi();

  const findLessons: InfiniteQueryHandler<
    Element<ILesson.FindUserLessonsApiResponse["list"]>
  > = useCallback(
    async ({ page }) => {
      if (userOnly && !query.users?.length) return { list: [], total: 0 };
      return await api.lesson.findLessons({
        page,
        ...query,
      });
    },
    [api.lesson, query, userOnly]
  );

  return useInfinitePaginationQuery(findLessons, [
    QueryKey.FindInfiniteLessons,
    query,
  ]);
}

export function useCancelLesson({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess<ILesson.CancelLessonApiResponse>;
  onError: OnError;
}) {
  const api = useApi();

  const cancel = useCallback(
    ({ id }: ILesson.CancelLessonApiParams) => {
      return api.lesson.cancel(id);
    },
    [api.lesson]
  );

  return useMutation({
    mutationFn: cancel,
    mutationKey: [MutationKey.CancelLesson],
    onSuccess,
    onError,
  });
}

export function useReportLesson({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess<ILesson.ReportLessonApiResponse>;
  onError: OnError;
}) {
  const api = useApi();

  const report = useCallback(
    ({ id }: ILesson.ReportLessonApiParams) => {
      return api.lesson.report(id);
    },
    [api.lesson]
  );

  return useMutation({
    mutationFn: report,
    mutationKey: [MutationKey.ReportLesson],
    onSuccess,
    onError,
  });
}

export function useCreateLesson({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess<ILesson.Self>;
  onError: OnError;
}) {
  const api = useApi();

  const create = useCallback(
    (payload: ILesson.CreateApiPayload) => api.lesson.create(payload),
    [api.lesson]
  );

  return useMutation({
    mutationFn: create,
    mutationKey: [MutationKey.CreateLesson],
    onSuccess,
    onError,
  });
}

export function useCreateLessonWithCard({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess<ILesson.CreateWithCardApiResponse>;
  onError?: OnError;
}) {
  const api = useApi();

  const create = useCallback(
    (payload: ILesson.CreateWithCardApiPayload) =>
      api.lesson.createWithCard(payload),
    [api.lesson]
  );

  return useMutation({
    mutationFn: create,
    mutationKey: [MutationKey.CreateLessonWithCard],
    onSuccess,
    onError,
  });
}

export function useCreateLessonWithEWallet({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess<ILesson.CreateWithEWalletApiResponse>;
  onError?: OnError;
}) {
  const api = useApi();

  const create = useCallback(
    (payload: ILesson.CreateWithEWalletApiPayload) =>
      api.lesson.createWithEWallet(payload),
    [api.lesson]
  );

  return useMutation({
    mutationFn: create,
    mutationKey: [MutationKey.CreateLessonWithEWallet],
    onSuccess,
    onError,
  });
}

export function useCreateLessonWithFawry({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess<ILesson.CreateWithFawryRefNumApiResponse>;
  onError?: OnError;
}) {
  const api = useApi();

  const create = useCallback(
    (payload: ILesson.CreateWithFawryRefNumApiPayload) =>
      api.lesson.createWithFawry(payload),
    [api.lesson]
  );

  return useMutation({
    mutationFn: create,
    mutationKey: [MutationKey.CreateLessonWithFawry],
    onSuccess,
    onError,
  });
}

export function useUpdateLesson({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess<ILesson.UpdateLessonApiResponse>;
  onError: OnError;
}) {
  const api = useApi();

  const updateLesson = useCallback(
    async (lesson: ILesson.UpdateApiPayload) => {
      return await api.lesson.update(lesson);
    },
    [api.lesson]
  );

  return useMutation({
    mutationFn: updateLesson,
    mutationKey: [MutationKey.UpdateLesson],
    onSuccess,
    onError,
  });
}

export function useFindLesson(id?: number) {
  const api = useApi();

  const findLessonById = useCallback(async () => {
    if (!id) return null;
    return api.lesson.findLesson(id);
  }, [api.lesson, id]);

  return useExtendedQuery({
    queryFn: findLessonById,
    queryKey: [QueryKey.FindLesson, id],
    enabled: !!id,
  });
}
