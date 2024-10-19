import { ICall, ILesson, IRule, Paginated, Void } from "@litespace/types";
import { useCallback } from "react";
import { useAtlas } from "@/atlas/index";
import { usePaginationQuery } from "@/query";
import { MutationKey, QueryKey } from "@/constants";
import {
  InfiniteData,
  UseInfiniteQueryResult,
  useMutation,
} from "@tanstack/react-query";

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
      return atlas.lesson.findUserLessons(user, {
        page: pageParam,
        size: 10,
      });
    },
    [user]
  );
  return usePaginationQuery(findUserLessons, [QueryKey.FindLesson]);
}

export function useCancelLesson() {
  const atlas = useAtlas();
  const cancel = useCallback((id: number) => {
    return atlas.lesson.cancel(id);
  }, []);
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
  }, [duration, selectedEvent, tutorId]);

  return useMutation({
    mutationFn: bookLesson,
    onSuccess,
    onError,
  });
}
