import { Route } from "@/types/routes";
import { useUser } from "@litespace/headless/context/user";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { PastLessonsTable } from "@litespace/luna/Lessons";
import { Typography } from "@litespace/luna/Typography";
import { ILesson, IUser } from "@litespace/types";
import { useCallback, useMemo, useState } from "react";
import BookLesson from "@/components/Lessons/BookLesson";
import { InView } from "react-intersection-observer";
import dayjs from "dayjs";
import { Loading } from "@litespace/luna/Loading";

function asLessons(list: ILesson.FindUserLessonsApiResponse["list"] | null) {
  if (!list) return [];

  return list.map((lesson) => {
    const teacher = lesson.members.find(
      (member) => member.role === IUser.Role.Tutor
    );
    return {
      id: lesson.lesson.id,
      start: lesson.lesson.start,
      duration: lesson.lesson.duration,
      tutor: {
        id: teacher?.userId || 0,
        name: teacher?.name || null,
        imageUrl: teacher?.image || null,
      },
    };
  });
}

export const PastLessons = () => {
  const intl = useFormatMessage();
  const [tutor, setTutor] = useState<number | null>(null);

  const closeRebookingDialog = useCallback(() => {
    setTutor(null);
  }, []);

  const openRebookingDialog = useCallback((tutorId: number) => {
    setTutor(tutorId);
  }, []);

  const { user } = useUser();
  const now = useMemo(() => dayjs.utc().toISOString(), []);

  const lessonsQuery = useInfiniteLessons({
    users: user ? [user?.id] : [],
    userOnly: true,
    before: now,
  });

  const lessons = useMemo(
    () => asLessons(lessonsQuery.list),
    [lessonsQuery.list]
  );

  return (
    <div className="grid gap-6 ">
      <Typography
        element="subtitle-2"
        weight="bold"
        className="text-natural-950 "
      >
        {intl("student-dashboard.previous-lessons.title")}
      </Typography>

      <PastLessonsTable
        tutorsRoute={Route.Tutors}
        onRebook={openRebookingDialog}
        lessons={lessons}
        loading={lessonsQuery.query.isPending}
        error={lessonsQuery.query.isError}
        retry={lessonsQuery.query.refetch}
      />

      {!lessonsQuery.query.isFetching && lessonsQuery.query.hasNextPage ? (
        <InView
          as="div"
          onChange={(inView) => {
            if (inView && lessonsQuery.query.hasNextPage) lessonsQuery.more();
          }}
        />
      ) : null}

      {lessonsQuery.query.isFetching && !lessonsQuery.query.isLoading ? (
        <Loading />
      ) : null}

      {tutor ? (
        <BookLesson
          close={closeRebookingDialog}
          open={!!tutor}
          tutorId={tutor}
        />
      ) : null}
    </div>
  );
};
