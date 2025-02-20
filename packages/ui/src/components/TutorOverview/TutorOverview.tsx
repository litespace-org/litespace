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
        icon={<Video16X16 className="[&>*]:tw-stroke-natural-50" width={16} />}
        title="tutor-dashboard.overview.total-lessons"
        value={formatNumber(totalLessonCount)}
        color="brand"
      />

      <Card
        icon={<Check16X16 className="[&]*:tw-stroke-natural-50" width={16} />}
        title="tutor-dashboard.overview.completed-lessons"
        value={formatNumber(completedLessonCount)}
        color="secondary"
      />

      <Card
        icon={<Clock16X16 className="[&]*:tw-stroke-natural-50" width={16} />}
        title="tutor-dashboard.overview.tutoring-time"
        value={tutoringTime}
        color="warning"
      />

      <Card
        icon={<People className="[&>*]:tw-stroke-natural-50" width={16} />}
        value={formatNumber(studentCount)}
        title="tutor-dashboard.overview.students"
        color="destructive"
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
          tag="label"
          className="tw-text-natural-600 tw-text-caption tw-font-regular"
        >
          {intl(title)}
        </Typography>
      </div>
      <Typography
        tag="label"
        className={cn(
          "tw-text-natural-950 tw-inline-block tw-self-start tw-border-b",
          "tw-text-h3 tw-font-semibold",
        )}
        style={{ borderBottomColor: `var(--${color}-500)` }}
      >
        {value}
      </Typography>
    </div>
  );
};

export default TutorOverview;
