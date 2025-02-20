import { Button } from "@/components/Button";
import { Loader, LoadingError } from "@/components/Loading";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import EmptyUpcomingLessons from "@litespace/assets/EmptyUpcomingLessons";
import ArrowLeft from "@litespace/assets/ArrowLeft";
import { Void } from "@litespace/types";
import cn from "classnames";
import React from "react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/Avatar";
import { dayjs, orUndefined } from "@litespace/utils";
import { Tooltip } from "@/components/Tooltip";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

type Props = {
  lessons: Array<{
    /**
     * Lesson start datetime in ISO UTC format.
     */
    start: string;
    /**
     * Lesson end datetime in ISO UTC format.
     */
    end: string;
    /**
     * tutor or student name
     */
    name?: string | null;
    /**
     * tutor or student id
     */
    userId?: number;
    /**
     * tutor or student image url
     */
    imageUrl?: string | null;
    /**
     * Link to join the lesson.
     */
    url: string;
  }>;
  /**
   * Lessons page url.
   */
  lessonsUrl: string;
  tutorsUrl: string;
  loading?: boolean;
  error?: boolean;
  retry?: Void;
};

/**
 * Upcoming lessons summary. Part of the student dashboard.
 */
export const UpcomingLessonsSummary: React.FC<Props> = ({
  lessons,
  lessonsUrl,
  tutorsUrl,
  loading,
  error,
  retry,
}) => {
  const intl = useFormatMessage();
  const mq = useMediaQuery();
  return (
    <div
      className={cn(
        "tw-border tw-border-transparent hover:tw-border-natural-100 tw-rounded-lg tw-p-4 sm:tw-p-6 tw-shadow-ls-x-small tw-bg-natural-50"
      )}
    >
      <Typography
        tag="label"
        className="tw-text-natural-950 tw-font-bold tw-text-body sm:tw-text-subtitle-2"
      >
        {intl("student-dashboard.upcoming-lessons.title")}
      </Typography>

      {error && retry && !loading ? (
        <div className="tw-w-full tw-h-96 tw-flex tw-justify-center tw-items-center">
          <LoadingError
            size={mq.sm ? "medium" : "small"}
            error={intl("student-dashboard.upcoming-lessons-summary.error")}
            retry={retry}
          />
        </div>
      ) : null}

      {loading ? (
        <div className="tw-w-full tw-h-96 tw-flex tw-justify-center tw-items-center">
          <Loader
            size={mq.sm ? "medium" : "small"}
            text={intl("student-dashboard.upcoming-lessons-summary.loading")}
          />
        </div>
      ) : null}

      {lessons && !error && !loading ? (
        <div>
          {lessons.length ? (
            <div className="tw-flex tw-flex-col tw-gap-4 tw-mt-4">
              {lessons.map((lesson, i) => (
                <Link
                  key={i}
                  to={lesson.url}
                  className="tw-flex tw-gap-2 tw-items-center"
                >
                  <div className="tw-w-[43px] tw-h-[43px] tw-rounded-[4px] tw-overflow-hidden">
                    <Avatar
                      alt={orUndefined(lesson.name)}
                      src={orUndefined(lesson.imageUrl)}
                      seed={lesson.userId?.toString()}
                    />
                  </div>
                  <div className="tw-flex tw-flex-col tw-justify-between tw-self-stretch">
                    <Typography
                      tag="label"
                      className="tw-text-natural-950 tw-text-caption tw-font-semibold"
                    >
                      {dayjs(lesson.start).format("dddd - D MMMM YYYY")}
                    </Typography>
                    <div className="tw-flex tw-justify-between">
                      <Tooltip
                        content={
                          <Typography tag="label" className="tw-text-natuarl-950">
                            {lesson.name}
                          </Typography>
                        }
                      >
                        <div>
                          <Typography
                            tag="label"
                            className="tw-block tw-text-natural-600 tw-me-1 tw-truncate tw-max-w-16 tw-font-regular tw-text-tiny"
                          >
                            {lesson.name}
                          </Typography>
                        </div>
                      </Tooltip>
                      <Typography
                        tag="label"
                        className="tw-block tw-text-natural-600 tw-ms-[18px] tw-text-tiny tw-font-regular"
                      >
                        {dayjs(lesson.start).format("h:mm")}
                        {" - "}
                        {dayjs(lesson.end).format("h:mm a")}
                      </Typography>
                    </div>
                  </div>
                  <div className="tw-w-6 tw-h-6 tw-mr-auto">
                    <ArrowLeft className="[&>*]:tw-stroke-natural-950" />
                  </div>
                </Link>
              ))}

              <Link to={lessonsUrl} className="tw-inline-block tw-w-full">
                <Button size="large" className="tw-w-full">
                  <Typography
                    tag="label"
                    className="tw-text-natural-50 tw-font-semibold tw-text-caption"
                  >
                    {intl("student-dashboard.button.show-all-lessons")}
                  </Typography>
                </Button>
              </Link>
            </div>
          ) : (
            <EmptyUpcomingLessonsComponent tutorsUrl={tutorsUrl} />
          )}
        </div>
      ) : null}
    </div>
  );
};

const EmptyUpcomingLessonsComponent: React.FC<{
  tutorsUrl: string;
}> = ({ tutorsUrl }) => {
  const intl = useFormatMessage();
  return (
    <div className={cn("tw-flex tw-flex-col tw-gap-12 tw-mt-8 lg:tw-mt-6")}>
      <div className={cn("tw-flex tw-flex-col tw-items-center tw-gap-6")}>
        <EmptyUpcomingLessons />
        <Typography
          tag="label"
          className="tw-text-natural-950 tw-font-bold sm:tw-font-semibold tw-text-caption sm:tw-text-subtitle-1"
        >
          {intl("student-dashboard.start-journey")}
        </Typography>
      </div>
      <Link to={tutorsUrl} className="tw-intline-block tw-w-full">
        <Button className="tw-w-full" size="large">
          <Typography
            tag="label"
            className="tw-text-natural-50 tw-font-semibold tw-text-caption"
          >
            {intl("student-dashboard.button.find-tutors")}
          </Typography>
        </Button>
      </Link>
    </div>
  );
};

export default UpcomingLessonsSummary;
