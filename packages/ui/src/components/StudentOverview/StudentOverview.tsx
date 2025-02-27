import React, { useMemo } from "react";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import Video from "@litespace/assets/Video";
import Check from "@litespace/assets/Check1";
import Clock from "@litespace/assets/Clock";
import People from "@litespace/assets/People";
import cn from "classnames";
import { LocalId } from "@/locales";
import { formatNumber } from "@/components/utils";
import { Void } from "@litespace/types";
import { Loader, LoadingError } from "@/components/Loading";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

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
        "p-3 sm:p-4 bg-natural-50 rounded-2xl shadow-ls-x-small",
        "border border-transparent hover:border-natural-100 w-full md:max-w-[215px]",
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
          className={cn(
            "w-5 sm:w-6 h-5 sm:h-6 rounded-md flex justify-center items-center p-1"
          )}
          style={{ backgroundColor: `var(--${color}-500)` }}
        >
          {icon}
        </div>
        <Typography
          tag="h1"
          className="text-natural-600 text-caption font-normal"
        >
          {intl(title)}
        </Typography>
      </div>
      <Typography
        tag="p"
        className={cn(
          "text-natural-950 inline-block self-start border-b",
          "text-base sm:text-[2.5rem] font-bold sm:font-semibold"
        )}
        style={{ borderBottomColor: `var(--${color}-500)` }}
      >
        {value}
      </Typography>
    </div>
  );
};

export default StudentOverview;
