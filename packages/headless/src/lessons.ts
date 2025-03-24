import { Element, IFilter, ILesson } from "@litespace/types";
import { useCallback } from "react";
import { useApi } from "@/api/index";
import { MutationKey, QueryKey } from "@/constants";
import { useMutation, useQuery } from "@tanstack/react-query";
import { UsePaginateResult, usePaginate } from "@/pagination";
import { InfiniteQueryHandler, useInfinitePaginationQuery } from "@/query";
import { OnError, OnSuccess } from "@/types/query";

export function useFindLessons({
  userOnly,
  ...query
}: ILesson.FindLessonsApiQuery & { userOnly?: boolean }): UsePaginateResult<{
  lesson: ILesson.Self;
  members: ILesson.PopuldatedMember[];
}> {
  const atlas = useApi();

  const findLessons = useCallback(
    async ({ page, size }: IFilter.Pagination) => {
      if (userOnly && !query.users?.length) return { list: [], total: 0 };
      return await atlas.lesson.findLessons({
        page,
        size,
        ...query,
      });
    },
    [atlas.lesson, query, userOnly]
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
  const atlas = useApi();

  const findLessons: InfiniteQueryHandler<
    Element<ILesson.FindUserLessonsApiResponse["list"]>
  > = useCallback(
    async ({ pageParam }) => {
      if (userOnly && !query.users?.length) return { list: [], total: 0 };
      return await atlas.lesson.findLessons({
        page: pageParam,
        ...query,
      });
    },
    [atlas.lesson, query, userOnly]
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
  const atlas = useApi();

  const cancel = useCallback(
    (id: number) => {
      return atlas.lesson.cancel(id);
    },
    [atlas.lesson]
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
  const atlas = useApi();

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
      return await atlas.lesson.create({
        tutorId,
        duration,
        slotId,
        start,
      });
    },
    [atlas.lesson]
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
  const atlas = useApi();

  const updateLesson = useCallback(
    async (lesson: ILesson.UpdateApiPayload) => {
      return await atlas.lesson.update(lesson);
    },
    [atlas.lesson]
  );

  return useMutation({
    mutationFn: updateLesson,
    mutationKey: [MutationKey.UpdateLesson],
    onSuccess,
    onError,
  });
}

export function useFindLesson(id?: number) {
  const atlas = useApi();

  const findLessonById = useCallback(async () => {
    if (!id) return null;
    return atlas.lesson.findLesson(id);
  }, [atlas.lesson, id]);

  return useQuery({
    queryFn: findLessonById,
    queryKey: [QueryKey.FindLesson, id],
  });
}
