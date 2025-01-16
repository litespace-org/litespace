import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { TutorOverview as Overview } from "@litespace/luna/TutorOverview";
import { Typography } from "@litespace/luna/Typography";
import { useFindPersonalizedTutorStats } from "@litespace/headless/tutor";

export const TutorOverview = () => {
  const intl = useFormatMessage();

  const statsQuery = useFindPersonalizedTutorStats();

  return (
    <div className="grid gap-6 justify-items-start w-full">
      <Typography
        element="subtitle-2"
        weight="bold"
        className="text-natural-950"
      >
        {intl("tutor-dashboard.overview.title")}
      </Typography>

      <Overview
        studentCount={statsQuery.data?.studentCount || 0}
        completedLessonCount={statsQuery.data?.completedLessonCount || 0}
        totalLearningTime={0}
        totalLessonCount={statsQuery.data?.completedLessonCount || 0}
        loading={statsQuery.isPending}
        error={statsQuery.isError}
        retry={statsQuery.refetch}
      />
    </div>
  );
};

export default TutorOverview;
