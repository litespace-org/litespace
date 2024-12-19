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
import { Duration } from "@litespace/sol/duration";

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
   * number of badges earned
   */
  badgesCount: number;
};
export const StudentOverview: React.FC<Props> = ({
  totalLessonCount,
  completedLessonCount,
  totalLearningTime,
  badgesCount,
}) => {
  const intl = useFormatMessage();
  const learningTime = useMemo(() => {
    if (totalLearningTime === 0) return "0";
    /**
     * NOTE: `humanize-duration` does not apply formating (adding coma) on
     * numbers (beyond 1k) (e.g., 1000h will be displayed as `1000 hours` instead
     * of `1,000 hours`).
     *
     * We can use `Intl.DurationFormat` but it has a limited availability (not
     * supported in firefox).
     *
     * The plan is to use `humanize-duration` below 1k hours then do manual
     * formating beyond this.
     */
    const duration = Duration.from(totalLearningTime.toString());

    if (totalLearningTime < 60)
      return duration.hours({ language: "ar-short", units: ["m"] });

    if (totalLearningTime < 60 * 1000)
      return duration.hours({ language: "ar-short" });

    const hours = Math.floor(totalLearningTime / 60);
    return intl("student-dashboard.overview.total-learning-time.unit", {
      value: formatNumber(hours),
    });
  }, [intl, totalLearningTime]);

  return (
    <div className="tw-flex tw-gap-6">
      <Card
        icon={<Video16X16 className="[&>*]:tw-stroke-natural-50" />}
        value={formatNumber(totalLessonCount)}
        color="brand"
        title="student-dashboard.overview.total-lessons"
      />
      <Card
        icon={<Check16X16 className="[&]*:tw-stroke-natural-50" />}
        value={formatNumber(completedLessonCount)}
        color="secondary"
        title="student-dashboard.overview.completed-lessons"
      />

      <Card
        icon={<Clock16X16 className="[&]*:tw-stroke-natural-50" />}
        value={learningTime}
        color="warning"
        title="student-dashboard.overview.total-learning-time"
      />

      <Card
        icon={<People className="[&>*]:tw-stroke-natural-50" />}
        value={formatNumber(badgesCount)}
        color="destructive"
        title="student-dashboard.overview.teachers"
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
        "tw-p-4 tw-bg-natural-50 tw-rounded-2xl tw-shadow-ls-small",
        "tw-border tw-border-transparent hover:tw-border-natural-100",
        "tw-basis-full tw-flex tw-flex-col tw-gap-2 tw-relative tw-overflow-hidden"
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

export default StudentOverview;
