import { Element, IFilter, ILesson, IRule, Void } from "@litespace/types";
import { useCallback } from "react";
import { useAtlas } from "@/atlas/index";
import { MutationKey, QueryKey } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { UsePaginateResult, usePaginate } from "@/pagination";
import { InfiniteQueryHandler, useInfinitePaginationQuery } from "./query";

type OnSuccess = Void;
type OnError = (error: Error) => void;

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

  return usePaginate(lessons, [QueryKey.FindLesson, query]);
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

export function useCancelLesson() {
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
  });
}

export function useCreateLesson({
  selectedEvent,
  tutorId,
  duration,
  onSuccess,
  onError,
}: {
  selectedEvent: IRule.RuleEvent | null;
  duration: ILesson.Duration;
  tutorId: number;
  onSuccess: OnSuccess;
  onError: OnError;
}) {
  const atlas = useAtlas();

  const bookLesson = useCallback(async () => {
    if (!selectedEvent) return;
    return await atlas.lesson.create({
      tutorId,
      duration,
      ruleId: selectedEvent.id,
      start: selectedEvent.start,
    });
  }, [atlas.lesson, duration, selectedEvent, tutorId]);

  return useMutation({
    mutationFn: bookLesson,
    onSuccess,
    onError,
  });
}
