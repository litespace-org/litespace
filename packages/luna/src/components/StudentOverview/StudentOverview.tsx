import React from "react";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import Video16X16 from "@litespace/assets/Video16X16";
import Check16X16 from "@litespace/assets/Check16X16";
import Clock16X16 from "@litespace/assets/Clock16X16";
import MedalBadge from "@litespace/assets/MedalBadge";
import cn from "classnames";
import { LocalId } from "@/locales";
import { formatMinutes, formatNumber } from "@/components/utils";

type Props = {
  /**
   * total number of lessons
   */
  totalLessons: number;
  /**
   * number of completed lessons
   */
  completedLessons: number;
  /**
   * total learning time
   */
  totalLearningTime: number;
  /**
   * number of badges earned
   */
  badges: number;
};

export const StudentOverview: React.FC<Props> = ({
  totalLessons,
  completedLessons,
  totalLearningTime,
  badges,
}) => {
  return (
    <div className="tw-flex tw-gap-6">
      <Card
        icon={<Video16X16 className="[&>*]:tw-stroke-natural-50" />}
        value={formatNumber(totalLessons)}
        color="brand-500"
        title="student-dashboard.overview.total-lessons"
      />
      <Card
        icon={<Check16X16 className="[&]*:tw-stroke-natural-50" />}
        value={formatNumber(completedLessons)}
        color="secondary-500"
        title="student-dashboard.overview.completed-lessons"
      />
      <Card
        icon={<Clock16X16 className="[&]*:tw-stroke-natural-50" />}
        value={formatMinutes(totalLearningTime)}
        color="warning-500"
        title="student-dashboard.overview.total-learning-time"
      />
      <Card
        icon={<MedalBadge className="[&]*:tw-stroke-natural-50" />}
        value={formatNumber(badges)}
        color="destructive-500"
        title="student-dashboard.overview.badges"
      />
    </div>
  );
};

export const Card: React.FC<{
  icon: React.JSX.Element;
  value: string;
  color: "brand-500" | "secondary-500" | "warning-500" | "destructive-500";
  title: LocalId;
}> = ({ value, icon, color, title }) => {
  const intl = useFormatMessage();

  return (
    <div
      className={cn(
        "tw-p-4 tw-bg-natural-50 tw-rounded-2xl tw-shadow-ls-small",
        "tw-border tw-border-transparent hover:tw-border-natural-100",
        "tw-basis-full tw-flex tw-flex-col tw-gap-2"
      )}
    >
      <div className="tw-flex tw-items-center tw-gap-2">
        <div
          className="tw-w-6 tw-h-6 tw-rounded-md tw-flex tw-justify-center tw-items-center"
          style={{ backgroundColor: `var(--${color})` }}
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
        style={{ borderBottomColor: `var(--${color})` }}
      >
        {value}
      </Typography>
    </div>
  );
};

export default StudentOverview;
