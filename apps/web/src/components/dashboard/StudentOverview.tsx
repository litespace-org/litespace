import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { StudentOverview as Overview } from "@litespace/ui/StudentOverview";
import { Typography } from "@litespace/ui/Typography";
import { useFindPersonalizedStudentStats } from "@litespace/headless/student";

export const StudentOverview: React.FC = () => {
  const intl = useFormatMessage();
  const statsQuery = useFindPersonalizedStudentStats();

  return (
    <div className="grid gap-4 sm:gap-6 justify-items-start w-full">
      <Typography
        element={{
          default: "body",
          sm: "subtitle-2",
        }}
        weight="bold"
        className="text-natural-950"
      >
        {intl("student-dashboard.overview.title")}
      </Typography>

      <Overview
        tutorCount={statsQuery.data?.tutorCount || 0}
        completedLessonCount={statsQuery.data?.completedLessonCount || 0}
        totalLearningTime={statsQuery.data?.totalLearningTime || 0}
        totalLessonCount={statsQuery.data?.completedLessonCount || 0}
        loading={statsQuery.isPending}
        error={statsQuery.isError}
        retry={statsQuery.refetch}
      />
    </div>
  );
};
