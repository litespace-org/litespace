import React, { useMemo } from "react";
import { useFormatMessage } from "@/hooks";
import Video from "@litespace/assets/Video";
import Check from "@litespace/assets/Check1";
import Clock from "@litespace/assets/Clock";
import People from "@litespace/assets/People";
import { formatNumber } from "@/components/utils";
import { Void } from "@litespace/types";
import { Loader, LoadingError } from "@/components/Loading";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { OverviewCard as Card } from "@/components/OverviewCard";

type Props = {
  /**
   * total number of lessons
   */
  totalLessonCount: number;
  /**
   * number of completed lessons
   */
  completedLessonCount: number;
  /**
   * total learning time in minutes
   */
  totalLearningTime: number;
  /**
   * number of tutors
   */
  tutorCount: number;
  loading?: boolean;
  error?: boolean;
  retry?: Void;
};

export const StudentOverview: React.FC<Props> = ({
  totalLessonCount,
  completedLessonCount,
  totalLearningTime,
  tutorCount,
  loading,
  error,
  retry,
}) => {
  const intl = useFormatMessage();
  const mq = useMediaQuery();

  const learningTime = useMemo(() => {
    if (totalLearningTime === 0) return "0";
    return intl("student-dashboard.overview.total-learning-time.unit.minute", {
      value: formatNumber(totalLearningTime),
    });
  }, [intl, totalLearningTime]);

  if (loading)
    return (
      <div className="flex items-center justify-center w-full h-40">
        <Loader
          size={mq.sm ? "medium" : "small"}
          text={intl("student-dashboard.overview.loading")}
        />
      </div>
    );

  if (error && retry)
    return (
      <div className="flex items-center justify-center w-full h-40">
        <LoadingError
          size={mq.sm ? "medium" : "small"}
          error={intl("student-dashboard.overview.error")}
          retry={retry}
        />
      </div>
    );

  return (
    <div className="grid grid-rows-2 grid-cols-2 md:flex gap-4 md:gap-6 flex-wrap w-full">
      <Card
        icon={
          <Video className="[&>*]:stroke-natural-50 w-3 sm:w-4 h-3 sm:h-4" />
        }
        value={formatNumber(totalLessonCount)}
        color="brand"
        title="student-dashboard.overview.total-lessons"
      />

      <Card
        icon={
          <Check className="[&>*]:stroke-natural-50 w-3 sm:w-4 h-3 sm:h-4" />
        }
        value={formatNumber(completedLessonCount)}
        color="secondary"
        title="student-dashboard.overview.completed-lessons"
      />

      <Card
        icon={
          <Clock className="[&>*]:stroke-natural-50 w-3 sm:w-4 h-3 sm:h-4" />
        }
        value={learningTime}
        color="warning"
        title="student-dashboard.overview.total-learning-time"
      />

      <Card
        icon={
          <People className="[&>*]:stroke-natural-50 w-3 sm:w-4 h-3 sm:h-4" />
        }
        value={formatNumber(tutorCount)}
        color="destructive"
        title="student-dashboard.overview.teachers"
      />
    </div>
  );
};

export default StudentOverview;
