import { useEffect, useMemo, useState } from "react";
import { useUser } from "@litespace/headless/context/user";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import { ILesson, Void } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { sortBy } from "lodash";

export function useFindSortedLessons(): {
  list: ILesson.FindUserLessonsApiResponse["list"];
  more: Void;
  refetch: Void;
  reset: Void;
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  hasNextPage: boolean;
} {
  const [futureLessons, setFutureLessons] = useState<
    ILesson.FindUserLessonsApiResponse["list"]
  >([]);
  const [pastLessons, setPastLessons] = useState<
    ILesson.FindUserLessonsApiResponse["list"]
  >([]);
  const { user } = useUser();

  const lessons = useInfiniteLessons({
    userOnly: true,
    users: user ? [user?.id] : [],
    size: 15,
  });

  // a callback function that returns true if the futureLessons
  // state includes the passed lesson id.
  const futureIncludes = (lessonId: number): boolean => {
    return !!futureLessons.find(({ lesson }) => lesson.id === lessonId);
  };

  useEffect(() => {
    const now = dayjs().subtract(ILesson.Duration.Long, "minutes");

    const futureList = lessons.list?.slice(pastLessons.length) || [];
    const newFutureLessons = futureList.filter(
      ({ lesson }) => !futureIncludes(lesson.id)
    );

    const newList =
      lessons.list?.slice(futureLessons.length + pastLessons.length) || [];
    const newPastLessons = newList.filter((l) => now.isAfter(l.lesson.start));

    setFutureLessons((prev) =>
      sortBy(
        [...prev, ...newFutureLessons],
        (l) => !!l.lesson.canceledAt || l.lesson.reported,
        (l) => l.lesson.start
      )
    );
    setPastLessons((prev) => [...prev, ...newPastLessons]);
  }, [lessons.list, futureLessons.length, pastLessons.length]);

  return useMemo(
    () => ({
      list: [...futureLessons, ...pastLessons],
      more: lessons.more,
      refetch: lessons.query.refetch,
      reset: () => {
        setFutureLessons([]);
        setPastLessons([]);
      },
      isPending: lessons.query.isPending,
      isFetching: lessons.query.isFetching,
      isError: lessons.query.isError,
      hasNextPage: lessons.query.hasNextPage,
    }),
    [
      futureLessons,
      pastLessons,
      lessons.more,
      lessons.query.refetch,
      lessons.query.isPending,
      lessons.query.isFetching,
      lessons.query.isError,
      lessons.query.hasNextPage,
    ]
  );
}

export function useFindThisWeekSortedLessons(date: string): {
  list: ILesson.FindUserLessonsApiResponse["list"];
  more: Void;
  refetch: Void;
  reset: Void;
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  hasNextPage: boolean;
} {
  const [futureLessons, setFutureLessons] = useState<
    ILesson.FindUserLessonsApiResponse["list"]
  >([]);
  const [pastLessons, setPastLessons] = useState<
    ILesson.FindUserLessonsApiResponse["list"]
  >([]);
  const { user } = useUser();

  const lessons = useInfiniteLessons({
    userOnly: true,
    users: user ? [user.id] : [],
    after: dayjs(date).toISOString(),
    before: dayjs(date).add(1, "week").toISOString(),
    full: true,
  });

  useEffect(() => {
    const now = dayjs().subtract(ILesson.Duration.Long, "minutes");

    const newList =
      lessons.list?.slice(futureLessons.length + pastLessons.length) || [];
    const newFutureLessons = newList.filter((l) =>
      now.isBefore(l.lesson.start)
    );
    const newPastLessons = newList.filter((l) => now.isAfter(l.lesson.start));

    setFutureLessons((prev) =>
      sortBy(
        [...prev, ...newFutureLessons],
        (l) => !!l.lesson.canceledAt || l.lesson.reported,
        (l) => l.lesson.start
      )
    );
    setPastLessons((prev) => [...prev, ...newPastLessons]);
  }, [lessons.list, futureLessons.length, pastLessons.length]);

  return useMemo(
    () => ({
      list: [...futureLessons, ...pastLessons],
      reset: () => {
        setFutureLessons([]);
        setPastLessons([]);
      },
      more: lessons.more,
      refetch: lessons.query.refetch,
      isPending: lessons.query.isPending,
      isFetching: lessons.query.isFetching,
      isError: lessons.query.isError,
      hasNextPage: lessons.query.hasNextPage,
    }),
    [
      futureLessons,
      pastLessons,
      lessons.more,
      lessons.query.refetch,
      lessons.query.isPending,
      lessons.query.isFetching,
      lessons.query.isError,
      lessons.query.hasNextPage,
    ]
  );
}
