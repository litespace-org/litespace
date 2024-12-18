import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { StudentOverview } from "@litespace/luna/StudentOverview";
import { Typography } from "@litespace/luna/Typography";
import { useFindPublicStudentStats } from "@litespace/headless/student";
import { Loader, LoadingError } from "@litespace/luna/Loading";

export const StudentOverviewWrapper = () => {
  const intl = useFormatMessage();

  const statsQuery = useFindPublicStudentStats();

  return (
    <div className="grid gap-6 justify-items-start">
      <Typography
        element="subtitle-2"
        weight="bold"
        className="text-natural-950"
      >
        {intl("student-dashboard.overview.title")}
      </Typography>

      {statsQuery.isLoading || statsQuery.isPending ? (
        <div className="w-full flex items-start justify-center [&>*]:mt-0">
          <Loader text={intl("student-dashboard.loading")} />
        </div>
      ) : null}

      {statsQuery.isError ? (
        <div className="w-full flex items-center justify-center [&>*]:mt-0">
          <LoadingError
            error={intl("student-dashboard.loading")}
            retry={statsQuery.refetch}
          />
        </div>
      ) : null}

      {statsQuery.data ? (
        <StudentOverview
          tutorCount={statsQuery.data.tutorCount}
          completedLessonCount={statsQuery.data.completedLessonCount}
          totalLearningTime={statsQuery.data.totalLearningTime}
          totalLessonCount={statsQuery.data.completedLessonCount}
        />
      ) : null}
    </div>
  );
};
