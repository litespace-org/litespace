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
      <div className="tw-flex tw-items-center tw-justify-center tw-w-full tw-h-40">
        <Loader
          size={mq.sm ? "medium" : "small"}
          text={intl("student-dashboard.overview.loading")}
        />
      </div>
    );

  if (error && retry)
    return (
      <div className="tw-flex tw-items-center tw-justify-center tw-w-full tw-h-40">
        <LoadingError
          size={mq.sm ? "medium" : "small"}
          error={intl("student-dashboard.overview.error")}
          retry={retry}
        />
      </div>
    );

  return (
    <div className="tw-grid tw-grid-rows-2 tw-grid-cols-2 md:tw-flex tw-gap-4 md:tw-gap-6 tw-flex-wrap tw-w-full">
      <Card
        icon={
          <Video className="[&>*]:tw-stroke-natural-50 tw-w-3 sm:tw-w-4 tw-h-3 sm:tw-h-4" />
        }
        value={formatNumber(totalLessonCount)}
        color="brand"
        title="student-dashboard.overview.total-lessons"
      />

      <Card
        icon={
          <Check className="[&>*]:tw-stroke-natural-50 tw-w-3 sm:tw-w-4 tw-h-3 sm:tw-h-4" />
        }
        value={formatNumber(completedLessonCount)}
        color="secondary"
        title="student-dashboard.overview.completed-lessons"
      />

      <Card
        icon={
          <Clock className="[&>*]:tw-stroke-natural-50 tw-w-3 sm:tw-w-4 tw-h-3 sm:tw-h-4" />
        }
        value={learningTime}
        color="warning"
        title="student-dashboard.overview.total-learning-time"
      />

      <Card
        icon={
          <People className="[&>*]:tw-stroke-natural-50 tw-w-3 sm:tw-w-4 tw-h-3 sm:tw-h-4" />
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
        "tw-p-3 sm:tw-p-4 tw-bg-natural-50 tw-rounded-2xl tw-shadow-ls-x-small",
        "tw-border tw-border-transparent hover:tw-border-natural-100 tw-w-full md:tw-max-w-[215px]",
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
            "tw-w-5 sm:tw-w-6 tw-h-5 sm:tw-h-6 tw-rounded-md tw-flex tw-justify-center tw-items-center tw-p-1"
          )}
          style={{ backgroundColor: `var(--${color}-500)` }}
        >
          {icon}
        </div>
        <Typography
          tag="h1"
          className="tw-text-natural-600 tw-text-caption tw-font-normal"
        >
          {intl(title)}
        </Typography>
      </div>
      <Typography
        tag="p"
        className={cn(
          "tw-text-natural-950 tw-inline-block tw-self-start tw-border-b",
          "tw-text-base sm:tw-text-[2.5rem] tw-font-bold sm:tw-font-semibold"
        )}
        style={{ borderBottomColor: `var(--${color}-500)` }}
      >
        {value}
      </Typography>
    </div>
  );
};

export default StudentOverview;
