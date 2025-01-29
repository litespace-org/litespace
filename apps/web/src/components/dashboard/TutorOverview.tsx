import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { TutorOverview as Overview } from "@litespace/ui/TutorOverview";
import { Typography } from "@litespace/ui/Typography";
import { useFindPersonalizedTutorStats } from "@litespace/headless/tutor";
import React from "react";

export const TutorOverview: React.FC = () => {
  const intl = useFormatMessage();
  const statsQuery = useFindPersonalizedTutorStats();

  return (
    <div className="flex flex-col gap-6 justify-items-start w-full">
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
        totalTutoringTime={statsQuery.data?.totalTutoringTime || 0}
        totalLessonCount={statsQuery.data?.completedLessonCount || 0}
        loading={statsQuery.isPending}
        error={statsQuery.isError}
        retry={statsQuery.refetch}
      />
    </div>
  );
};

export default TutorOverview;
