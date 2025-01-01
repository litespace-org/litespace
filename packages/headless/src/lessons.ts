import { Element, IFilter, ILesson } from "@litespace/types";
import { useCallback } from "react";
import { useAtlas } from "@/atlas/index";
import { MutationKey, QueryKey } from "@/constants";
import { useMutation, useQuery } from "@tanstack/react-query";
import { UsePaginateResult, usePaginate } from "@/pagination";
import { InfiniteQueryHandler, useInfinitePaginationQuery } from "@/query";
import { OnError, OnSuccess } from "@/types/query";

export function useFindLessons(
  query: ILesson.FindLessonsApiQuery & { userOnly?: boolean }
): UsePaginateResult<{
  lesson: ILesson.Self;
  members: ILesson.PopuldatedMember[];
}> {
  const atlas = useAtlas();

  const lessons = useCallback(
    async ({ page, size }: IFilter.Pagination) => {
      if (query.userOnly && !query.users?.length) return { list: [], total: 0 };
      return await atlas.lesson.findLessons({ page, size, ...query });
    },
    [atlas.lesson, query]
  );

  return usePaginate(lessons, [QueryKey.FindLessons, query]);
}

/**
 * Paginate lessons using infinite pagination.
 */
export function useInfiniteLessons(
  query: ILesson.FindLessonsApiQuery & { userOnly?: boolean }
) {
  const atlas = useAtlas();

  const findLessons: InfiniteQueryHandler<
    Element<ILesson.FindUserLessonsApiResponse["list"]>
  > = useCallback(
    async ({ pageParam }) => {
      if (query.userOnly && !query.users?.length) return { list: [], total: 0 };
      return await atlas.lesson.findLessons({
        page: pageParam,
        ...query,
      });
    },
    [atlas.lesson, query]
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
  const atlas = useAtlas();

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
  const atlas = useAtlas();

  const bookLesson = useCallback(
    async ({
      tutorId,
      ruleId,
      start,
      duration,
    }: {
      tutorId: number;
      ruleId: number;
      start: string;
      duration: ILesson.Duration;
    }) => {
      return await atlas.lesson.create({
        tutorId,
        duration,
        ruleId,
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

export function useFindLesson(id?: number) {
  const atlas = useAtlas();

  const findLessonById = useCallback(async () => {
    if (!id) return null;
    return atlas.lesson.findLesson(id);
  }, [atlas.lesson, id]);

  return useQuery({
    queryFn: findLessonById,
    queryKey: [QueryKey.FindLesson, id],
  });
}
