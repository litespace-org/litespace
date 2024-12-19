import { Route } from "@/types/routes";
import { useUser } from "@litespace/headless/context/user";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import { UpcomingLessonsSummary } from "@litespace/luna/Lessons";
import { ILesson, IUser } from "@litespace/types";
import { useMemo } from "react";

function organizeUpcomingLessons(
  list: ILesson.FindUserLessonsApiResponse["list"] | null
) {
  return (
    list?.map((item) => ({
      start: item.lesson.start,
      tutorName:
        item.members.find((member) => member.role === IUser.Role.Tutor)?.name ||
        null,
      url: Route.Call,
    })) || []
  );
}

export const UpcomingLessonsSummaryWrapper = () => {
  const { user } = useUser();

  const lessonsQuery = useInfiniteLessons({
    users: user ? [user?.id] : [],
    userOnly: true,
    future: true,
    past: false,
    size: 4,
  });
  const lessons = useMemo(
    () => organizeUpcomingLessons(lessonsQuery.list),
    [lessonsQuery.list]
  );
  return (
    <UpcomingLessonsSummary
      loading={lessonsQuery.query.isLoading || lessonsQuery.query.isPending}
      error={lessonsQuery.query.isError}
      retry={lessonsQuery.query.refetch}
      lessons={lessons}
      lessonsUrl={Route.UpcomingLessons}
      tutorsUrl={Route.Tutors}
    />
  );
};
