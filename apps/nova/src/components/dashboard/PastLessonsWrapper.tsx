import { Route } from "@/types/routes";
import { useUser } from "@litespace/headless/context/user";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { PastLessonsTable } from "@litespace/luna/Lessons";
import { Typography } from "@litespace/luna/Typography";
import { ILesson, IUser } from "@litespace/types";
import { useCallback, useMemo, useState } from "react";
import BookLesson from "@/components/Lessons/BookLesson";
import { LoadingError, Loader } from "@litespace/luna/Loading";
import { InView } from "react-intersection-observer";

function organizeLessons(
  list: ILesson.FindUserLessonsApiResponse["list"] | null
) {
  return (
    list?.map((lesson) => {
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
    }) || []
  );
}

export const PastLessonsWrapper = () => {
  const intl = useFormatMessage();
  const [tutor, setTutor] = useState<number | null>(null);

  const closeRebookingDialog = useCallback(() => {
    setTutor(null);
  }, []);

  const openRebookingDialog = useCallback((tutorId: number) => {
    setTutor(tutorId);
  }, []);

  const { user } = useUser();
  const lessonsQuery = useInfiniteLessons({
    users: user ? [user?.id] : [],
    userOnly: true,
    past: true,
    future: false,
    size: 8,
  });

  const lessons = useMemo(
    () => organizeLessons(lessonsQuery.list),
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

      {lessonsQuery.query.isError ? (
        <LoadingError
          error={intl("student-dashboard.error")}
          retry={lessonsQuery.query.refetch}
        />
      ) : null}

      {lessonsQuery.query.isPending || lessonsQuery.query.isLoading ? (
        <div className="[&>*]:mt-0">
          <Loader text={intl("student-dashboard.loading")} />
        </div>
      ) : null}

      {lessons &&
      !lessonsQuery.query.isLoading &&
      !lessonsQuery.query.isError ? (
        <InView
          as="div"
          onChange={(inView) => {
            if (inView && lessonsQuery.query.hasNextPage) lessonsQuery.more();
          }}
          className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-border-stronger scrollbar-track-surface-300"
        >
          <PastLessonsTable
            tutorsRoute={Route.Tutors}
            onRebook={openRebookingDialog}
            lessons={lessons}
          />
        </InView>
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
