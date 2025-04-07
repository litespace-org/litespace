import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { TutorOverview as Overview } from "@litespace/ui/TutorOverview";
import { Typography } from "@litespace/ui/Typography";
import { useFindPersonalizedTutorStats } from "@litespace/headless/tutor";
import React from "react";
import { useOnError } from "@/hooks/error";

export const TutorOverview: React.FC = () => {
  const intl = useFormatMessage();
  const { query, keys } = useFindPersonalizedTutorStats();

  useOnError({
    type: "query",
    error: query.error,
    keys,
  });

  return (
    <div className="md:col-span-2 flex flex-col gap-4 lg:gap-6 justify-items-start w-full">
      <Typography
        tag="h1"
        className="text-natural-950 text-body md:text-subtitle-2 font-bold"
      >
        {intl("tutor-dashboard.overview.title")}
      </Typography>

      <Overview
        studentCount={query.data?.studentCount || 0}
        completedLessonCount={query.data?.completedLessonCount || 0}
        totalTutoringTime={query.data?.totalTutoringTime || 0}
        totalLessonCount={query.data?.completedLessonCount || 0}
        loading={query.isPending}
        error={query.isError}
        retry={query.refetch}
      />
    </div>
  );
};

export default TutorOverview;
