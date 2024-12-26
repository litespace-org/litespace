import { Route } from "@/types/routes";
import { useUser } from "@litespace/headless/context/user";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import { UpcomingLessonsSummary as Summary } from "@litespace/luna/Lessons";
import { ILesson, IUser } from "@litespace/types";
import dayjs from "dayjs";
import { useMemo } from "react";

function asUpcomingLessons(
  list: ILesson.FindUserLessonsApiResponse["list"] | null
) {
  if (!list) return [];

  return list.map((item) => ({
    start: item.lesson.start,
    tutorName:
      item.members.find((member) => member.role === IUser.Role.Tutor)?.name ||
      null,
    url: Route.Call,
  }));
}

export const UpcomingLessons = () => {
  const { user } = useUser();

  const now = useMemo(() => dayjs.utc().toISOString(), []);
  const lessonsQuery = useInfiniteLessons({
    users: user ? [user?.id] : [],
    userOnly: true,
    after: now,
    size: 4,
  });
  const lessons = useMemo(
    () => asUpcomingLessons(lessonsQuery.list),
    [lessonsQuery.list]
  );
  return (
    <Summary
      loading={lessonsQuery.query.isPending}
      error={lessonsQuery.query.isError}
      retry={lessonsQuery.query.refetch}
      lessons={lessons}
      lessonsUrl={Route.UpcomingLessons}
      tutorsUrl={Route.Tutors}
    />
  );
};
