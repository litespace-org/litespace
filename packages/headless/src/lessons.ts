import {
  ICall,
  IFilter,
  ILesson,
  IRule,
  Paginated,
  Void,
} from "@litespace/types";
import { useCallback } from "react";
import { useAtlas } from "@/atlas/index";
import { useInfinitePaginationQuery } from "@/query";
import { MutationKey, QueryKey } from "@/constants";
import {
  InfiniteData,
  UseInfiniteQueryResult,
  useMutation,
} from "@tanstack/react-query";
import { UsePaginateResult, usePaginate } from "@/pagination";

type OnSuccess = Void;
type OnError = (error: Error) => void;
type useFindUserLessonsProps = {
  query: UseInfiniteQueryResult<
    InfiniteData<
      Paginated<{
        lesson: ILesson.Self;
        members: ILesson.PopuldatedMember[];
        call: ICall.Self;
      }>,
      unknown
    >,
    Error
  >;
  list:
    | {
        lesson: ILesson.Self;
        members: ILesson.PopuldatedMember[];
        call: ICall.Self;
      }[]
    | null;
  more: () => void;
};

export function useFindUserLessons(user?: number): useFindUserLessonsProps {
  const atlas = useAtlas();

  const findUserLessons = useCallback(
    async ({
      pageParam,
    }: {
      pageParam: number;
    }): Promise<ILesson.FindUserLessonsApiResponse> => {
      if (!user) return { list: [], total: 0 };
      return atlas.lesson.findLessons({
        users: [user],
        page: pageParam,
        size: 10,
      });
    },
    [atlas.lesson, user]
  );
  return useInfinitePaginationQuery(findUserLessons, [QueryKey.FindUserLesson]);
}

export function useFindLessons(
  query: ILesson.FindLessonsApiQuery
): UsePaginateResult<{
  lesson: ILesson.Self;
  members: ILesson.PopuldatedMember[];
  call: ICall.Self;
}> {
  const atlas = useAtlas();

  const lessons = useCallback(
    async ({ page, size }: IFilter.Pagination) => {
      return await atlas.lesson.findLessons({ page, size, ...query });
    },
    [atlas.lesson, query]
  );

  return usePaginate(lessons, [QueryKey.FindLesson, query]);
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
