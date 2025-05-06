import { Loading, LoadingError } from "@/components/Loading";
import { formatNumber } from "@/components/utils";
import { useFormatMessage } from "@/hooks";
import Check from "@litespace/assets/Check16X16";
import Clock from "@litespace/assets/Clock";
import People from "@litespace/assets/People";
import Video from "@litespace/assets/Video";
import { Void } from "@litespace/types";
import React, { useMemo } from "react";
import { OverviewCard as Card } from "@/components/OverviewCard";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

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
  const { md } = useMediaQuery();
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
        <Loading
          size={md ? "medium" : "small"}
          text={intl("tutor-dashboard.overview.loading")}
        />
      </div>
    );

  if (error && retry)
    return (
      <div className="flex items-center justify-center w-full h-40">
        <LoadingError
          size={md ? "medium" : "small"}
          error={intl("tutor-dashboard.overview.error")}
          retry={retry}
        />
      </div>
    );

  return (
    <div className="grid grid-cols-4 gap-4 lg:gap-6 w-full">
      <Card
        icon={
          <Video className="w-3 h-3 md:w-4 md:h-4 [&>*]:stroke-natural-50" />
        }
        title="tutor-dashboard.overview.total-lessons"
        value={formatNumber(totalLessonCount)}
        color="brand"
        className="col-span-2 md:col-span-1 lg:col-span-2 xl:col-span-1"
      />

      <Card
        icon={
          <Check className="w-3 h-3 md:w-4 md:h-[17px] [&>*]:stroke-natural-50" />
        }
        title="tutor-dashboard.overview.completed-lessons"
        value={formatNumber(completedLessonCount)}
        color="secondary"
        className="col-span-2 md:col-span-1 lg:col-span-2 xl:col-span-1"
      />

      <Card
        icon={
          <Clock className="w-3 h-3 md:w-4 md:h-4 [&>*]:stroke-natural-50" />
        }
        title="tutor-dashboard.overview.tutoring-time"
        value={tutoringTime}
        color="warning"
        className="col-span-2 md:col-span-1 lg:col-span-2 xl:col-span-1"
      />

      <Card
        icon={
          <People className="w-3 h-3 md:w-4 md:h-4 [&>*]:stroke-natural-50" />
        }
        value={formatNumber(studentCount)}
        title="tutor-dashboard.overview.students"
        color="destructive"
        className="col-span-2 md:col-span-1 lg:col-span-2 xl:col-span-1"
      />
    </div>
  );
};

export default TutorOverview;
