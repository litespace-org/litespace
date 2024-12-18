import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { StudentOverview } from "@litespace/luna/StudentOverview";
import { Typography } from "@litespace/luna/Typography";

export const StudentOverviewWrapper = () => {
  const intl = useFormatMessage();
  // TODO: Implement stat fetching
  return (
    <div className="grid gap-6 justify-items-start">
      <Typography
        element="subtitle-2"
        weight="bold"
        className="text-natural-950"
      >
        {intl("student-dashboard.overview.title")}
      </Typography>
      <StudentOverview
        badgesCount={5}
        completedLessonCount={120}
        totalLearningTime={300}
        totalLessonCount={13}
      />
    </div>
  );
};
