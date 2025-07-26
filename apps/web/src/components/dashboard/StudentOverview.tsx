import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { StudentOverview as Overview } from "@litespace/ui/StudentOverview";
import { Typography } from "@litespace/ui/Typography";
import { useFindPersonalizedStudentStats } from "@litespace/headless/student";
import { useOnError } from "@/hooks/error";
import { Void } from "@litespace/types";
import { useEffect } from "react";

export const StudentOverview: React.FC<{
  setIsEmptyLessons: Void;
}> = ({ setIsEmptyLessons }) => {
  const intl = useFormatMessage();
  const { query, keys } = useFindPersonalizedStudentStats();

  useOnError({
    type: "query",
    error: query.error,
    keys,
  });

  useEffect(() => {
    if (query.data?.completedLessonCount === 0) setIsEmptyLessons();
  }, [query.data?.completedLessonCount, setIsEmptyLessons]);

  return (
    <div className="grid gap-4 sm:gap-6 justify-items-start w-full">
      <Typography
        tag="h1"
        className="text-natural-950 text-body md:text-subtitle-2 font-bold"
      >
        {intl("student-dashboard.overview.title")}
      </Typography>

      <Overview
        tutorCount={query.data?.tutorCount || 0}
        completedLessonCount={query.data?.completedLessonCount || 0}
        totalLearningTime={query.data?.totalLearningTime || 0}
        totalLessonCount={query.data?.completedLessonCount || 0}
        loading={query.isPending}
        error={query.isError}
        retry={query.refetch}
      />
    </div>
  );
};
