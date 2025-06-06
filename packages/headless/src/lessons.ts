import { Element, IFilter, ILesson } from "@litespace/types";
import { useCallback } from "react";
import { useApi } from "@/api/index";
import { MutationKey, QueryKey } from "@/constants";
import { useMutation } from "@tanstack/react-query";
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
}: ILesson.FindLessonsApiQuery & { userOnly?: boolean }): UsePaginateResult<{
  lesson: ILesson.Self;
  members: ILesson.PopuldatedMember[];
}> {
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
  onSuccess: OnSuccess<void>;
  onError: OnError;
}) {
  const api = useApi();

  const cancel = useCallback(
    (id: number) => {
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

export function useCreateLesson({
  onSuccess,
  onError,
}: {
  onSuccess: OnSuccess<ILesson.Self>;
  onError: OnError;
}) {
  const api = useApi();

  const bookLesson = useCallback(
    async ({
      tutorId,
      slotId,
      start,
      duration,
    }: {
      tutorId: number;
      slotId: number;
      start: string;
      duration: ILesson.Duration;
    }) => {
      return await api.lesson.create({
        tutorId,
        duration,
        slotId,
        start,
      });
    },
    [api.lesson]
  );

  return useMutation({
    mutationFn: bookLesson,
    mutationKey: [MutationKey.BookLesson],
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
