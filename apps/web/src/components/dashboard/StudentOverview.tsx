import { Void } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { StudentOverview as Overview } from "@litespace/ui/StudentOverview";
import { Typography } from "@litespace/ui/Typography";

export const StudentOverview: React.FC<{
  tutorCount: number;
  completedLessonCount: number;
  totalLearningTime: number;
  isPending: boolean;
  isError: boolean;
  refetch: Void;
}> = ({
  tutorCount,
  completedLessonCount,
  totalLearningTime,
  isError,
  isPending,
  refetch,
}) => {
  const intl = useFormatMessage();

  return (
    <div className="grid gap-4 sm:gap-6 justify-items-start w-full">
      <Typography
        tag="h1"
        className="text-natural-950 text-body md:text-subtitle-2 font-bold"
      >
        {intl("student-dashboard.overview.title")}
      </Typography>

      <Overview
        tutorCount={tutorCount || 0}
        completedLessonCount={completedLessonCount || 0}
        totalLearningTime={totalLearningTime || 0}
        totalLessonCount={completedLessonCount || 0}
        loading={isPending}
        error={isError}
        retry={refetch}
      />
    </div>
  );
};
