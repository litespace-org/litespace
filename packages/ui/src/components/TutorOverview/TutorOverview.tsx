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
        "p-4 bg-natural-50 rounded-2xl shadow-ls-x-small",
        "border border-transparent hover:border-natural-100 max-w-[215px]",
        "basis-full flex flex-col justify-between gap-2 relative overflow-hidden"
      )}
    >
      <div
        className={cn(
          "absolute top-0 left-11 -translate-y-1/2 -translate-x-1/2",
          "w-[69px] h-[69px] rounded-full"
        )}
        style={{ background: `var(--${color}-100)` }}
      />
      <div
        className={cn(
          "absolute top-0 left-2 -translate-y-1/2 -translate-x-1/2",
          "w-[69px] h-[69px] rounded-full"
        )}
        style={{ background: `var(--${color}-200)` }}
      />
      <div className="flex items-center gap-2 z-10">
        <div
          className={cn("w-6 h-6 rounded-md flex justify-center items-center")}
          style={{ backgroundColor: `var(--${color}-500)` }}
        >
          {icon}
        </div>
        <Typography
          tag="h2"
          className="text-natural-600 text-caption font-normal"
        >
          {intl(title)}
        </Typography>
      </div>
      <Typography
        tag="p"
        className={cn(
          "text-natural-950 inline-block self-start border-b",
          "text-h3 font-semibold"
        )}
        style={{ borderBottomColor: `var(--${color}-500)` }}
      >
        {value}
      </Typography>
    </div>
  );
};

export default TutorOverview;
