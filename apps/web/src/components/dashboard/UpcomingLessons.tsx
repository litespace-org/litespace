import dayjs from "@/lib/dayjs";
import { useUser } from "@litespace/headless/context/user";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import { UpcomingLessonsSummary as Summary } from "@litespace/ui/Lessons";
import { ILesson, IUser } from "@litespace/types";
import { useMemo } from "react";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";
import { isTutor } from "@litespace/utils";

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
      userId: member?.userId || 0,
      imageUrl: member?.image || null,
      url: router.web({ route: Web.Lesson, id: item.lesson.id }),
    };
  });
}

export const UpcomingLessons = () => {
  const { user } = useUser();

  const now = useMemo(() => dayjs.utc().toISOString(), []);
  const lessonsQuery = useInfiniteLessons({
    users: user ? [user?.id] : [],
    userOnly: true,
    after: now,
    canceled: false,
    size: 4,
  });

  const lessons = useMemo(
    () => asUpcomingLessons(lessonsQuery.list, user?.role),
    [lessonsQuery.list, user?.role]
  );

  return (
    <div className="md:col-span-1">
      <Summary
        loading={lessonsQuery.query.isPending}
        error={lessonsQuery.query.isError}
        retry={lessonsQuery.query.refetch}
        lessonsUrl={Web.Lessons}
        tutorsUrl={Web.Tutors}
        lessons={lessons}
        isTutor={isTutor(user)}
        scheduleUrl={Web.ScheduleManagement}
      />
    </div>
  );
};
