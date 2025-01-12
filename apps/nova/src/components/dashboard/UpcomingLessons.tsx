import dayjs from "@/lib/dayjs";
import { Route } from "@/types/routes";
import { useUserContext } from "@litespace/headless/context/user";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import { asFullAssetUrl } from "@litespace/luna/backend";
import { UpcomingLessonsSummary as Summary } from "@litespace/luna/Lessons";
import { ILesson, IUser } from "@litespace/types";
import { useMemo } from "react";

function asUpcomingLessons(
  list: ILesson.FindUserLessonsApiResponse["list"] | null,
  userRole?: IUser.Role
) {
  if (!list || !userRole) return [];

  return list.map((item) => {
    const member = item.members.find((member) => member.role !== userRole);

    return {
      start: item.lesson.start,
      end: dayjs(item.lesson.start)
        .add(item.lesson.duration, "minutes")
        .toISOString(),
      name: member?.name || null,
      id: member?.userId || 0,
      imageUrl: member?.image ? asFullAssetUrl(member.image) : null,
      url: Route.Call,
    };
  });
}

export const UpcomingLessons = () => {
  const { user } = useUserContext();

  const now = useMemo(() => dayjs.utc().toISOString(), []);
  const lessonsQuery = useInfiniteLessons({
    users: user ? [user?.id] : [],
    userOnly: true,
    after: now,
    size: 4,
  });
  const lessons = useMemo(
    () => asUpcomingLessons(lessonsQuery.list, user?.role),
    [lessonsQuery.list, user?.role]
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
