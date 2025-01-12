import React, { useMemo } from "react";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import Video16X16 from "@litespace/assets/Video16X16";
import Check16X16 from "@litespace/assets/Check16X16";
import Clock16X16 from "@litespace/assets/Clock16X16";
import People from "@litespace/assets/People";
import cn from "classnames";
import { LocalId } from "@/locales";
import { formatNumber } from "@/components/utils";
import { Void } from "@litespace/types";
import { Loader, LoadingError } from "@/components/Loading";

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
   * number of students
   */
  studentCount: number;
  loading?: boolean;
  error?: boolean;
  retry?: Void;
};

export const TutorOverview: React.FC<Props> = ({
  totalLessonCount,
  completedLessonCount,
  totalLearningTime,
  studentCount,
  loading,
  error,
  retry,
}) => {
  const intl = useFormatMessage();
  const learningTime = useMemo(() => {
    if (totalLearningTime === 0) return "0";

    return intl("tutor-dashboard.overview.total-learning-time.unit.minute", {
      value: formatNumber(totalLearningTime),
    });
  }, [intl, totalLearningTime]);

  if (loading)
    return (
      <div className="tw-flex tw-items-center tw-justify-center tw-w-full tw-h-40">
        <Loader size="medium" text={intl("tutor-dashboard.overview.loading")} />
      </div>
    );

  if (error && retry)
    return (
      <div className="tw-flex tw-items-center tw-justify-center tw-w-full tw-h-40">
        <LoadingError
          size="medium"
          error={intl("tutor-dashboard.overview.error")}
          retry={retry}
        />
      </div>
    );

  return (
    <div className="tw-flex tw-gap-6 tw-flex-wrap tw-w-full">
      <Card
        icon={<Video16X16 className="[&>*]:tw-stroke-natural-50" />}
        value={formatNumber(totalLessonCount)}
        color="brand"
        title="tutor-dashboard.overview.total-lessons"
      />

      <Card
        icon={<Check16X16 className="[&]*:tw-stroke-natural-50" />}
        value={formatNumber(completedLessonCount)}
        color="secondary"
        title="tutor-dashboard.overview.completed-lessons"
      />

      <Card
        icon={<Clock16X16 className="[&]*:tw-stroke-natural-50" />}
        value={learningTime}
        color="warning"
        title="tutor-dashboard.overview.total-learning-time"
      />

      <Card
        icon={<People className="[&>*]:tw-stroke-natural-50" />}
        value={formatNumber(studentCount)}
        color="destructive"
        title="tutor-dashboard.overview.students"
      />
    </div>
  );
};

export const Card: React.FC<{
  icon: React.JSX.Element;
  value: string;
  color: "brand" | "secondary" | "warning" | "destructive";
  title: LocalId;
  className?: string;
}> = ({ value, icon, color, title }) => {
  const intl = useFormatMessage();

  return (
    <div
      className={cn(
        "tw-p-4 tw-bg-natural-50 tw-rounded-2xl tw-shadow-ls-x-small",
        "tw-border tw-border-transparent hover:tw-border-natural-100 tw-max-w-[215px]",
        "tw-basis-full tw-flex tw-flex-col tw-justify-between tw-gap-2 tw-relative tw-overflow-hidden"
      )}
    >
      <div
        className={cn(
          "tw-absolute tw-top-0 tw-left-11 -tw-translate-y-1/2 -tw-translate-x-1/2",
          "tw-w-[69px] tw-h-[69px] tw-rounded-full"
        )}
        style={{ background: `var(--${color}-100)` }}
      />
      <div
        className={cn(
          "tw-absolute tw-top-0 tw-left-2 -tw-translate-y-1/2 -tw-translate-x-1/2",
          "tw-w-[69px] tw-h-[69px] tw-rounded-full"
        )}
        style={{ background: `var(--${color}-200)` }}
      />
      <div className="tw-flex tw-items-center tw-gap-2 tw-z-10">
        <div
          className={cn(
            "tw-w-6 tw-h-6 tw-rounded-md tw-flex tw-justify-center tw-items-center"
          )}
          style={{ backgroundColor: `var(--${color}-500)` }}
        >
          {icon}
        </div>
        <Typography
          element="caption"
          weight="regular"
          className="tw-text-natural-600"
        >
          {intl(title)}
        </Typography>
      </div>
      <Typography
        element="h3"
        weight="semibold"
        className={cn(
          "tw-text-natural-950 tw-inline-block tw-self-start tw-border-b"
        )}
        style={{ borderBottomColor: `var(--${color}-500)` }}
      >
        {value}
      </Typography>
    </div>
  );
};

export default TutorOverview;
