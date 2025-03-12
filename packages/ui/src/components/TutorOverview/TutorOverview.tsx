import { Loader, LoadingError } from "@/components/Loading";
import { formatNumber } from "@/components/utils";
import { useFormatMessage } from "@/hooks";
import Check16X16 from "@litespace/assets/Check16X16";
import Clock16X16 from "@litespace/assets/Clock16X16";
import People from "@litespace/assets/People";
import Video16X16 from "@litespace/assets/Video16X16";
import { Void } from "@litespace/types";
import React, { useMemo } from "react";
import { OverviewCard as Card } from "@/components/OverviewCard";

type Props = {
  /**
   * Total number of lessons
   */
  totalLessonCount: number;
  /**
   * Number of completed lessons
   */
  completedLessonCount: number;
  /**
   * Total tutoring time in minutes
   */
  totalTutoringTime: number;
  /**
   * Number of students
   */
  studentCount: number;
  loading?: boolean;
  error?: boolean;
  retry?: Void;
};

export const TutorOverview: React.FC<Props> = ({
  totalLessonCount,
  completedLessonCount,
  totalTutoringTime,
  studentCount,
  loading,
  error,
  retry,
}) => {
  const intl = useFormatMessage();
  const tutoringTime = useMemo(() => {
    if (totalTutoringTime === 0) return "0";
    return intl("tutor-dashboard.overview.total-learning-time.unit.minute", {
      value: formatNumber(totalTutoringTime),
    });
  }, [intl, totalTutoringTime]);

  if (loading)
    return (
      <div className="flex items-center justify-center w-full h-40">
        <Loader size="medium" text={intl("tutor-dashboard.overview.loading")} />
      </div>
    );

  if (error && retry)
    return (
      <div className="flex items-center justify-center w-full h-40">
        <LoadingError
          size="medium"
          error={intl("tutor-dashboard.overview.error")}
          retry={retry}
        />
      </div>
    );

  return (
    <div className="flex gap-6 flex-wrap w-full">
      <Card
        icon={<Video16X16 className="[&>*]:stroke-natural-50" width={16} />}
        title="tutor-dashboard.overview.total-lessons"
        value={formatNumber(totalLessonCount)}
        color="brand"
      />

      <Card
        icon={<Check16X16 className="[&]*:stroke-natural-50" width={16} />}
        title="tutor-dashboard.overview.completed-lessons"
        value={formatNumber(completedLessonCount)}
        color="secondary"
      />

      <Card
        icon={<Clock16X16 className="[&]*:stroke-natural-50" width={16} />}
        title="tutor-dashboard.overview.tutoring-time"
        value={tutoringTime}
        color="warning"
      />

      <Card
        icon={<People className="[&>*]:stroke-natural-50" width={16} />}
        value={formatNumber(studentCount)}
        title="tutor-dashboard.overview.students"
        color="destructive"
      />
    </div>
  );
};

export default TutorOverview;
