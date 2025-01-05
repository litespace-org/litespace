import React from "react";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { Link } from "react-router-dom";
import Video from "@litespace/assets/Video";
import { Button, ButtonSize } from "@/components/Button";
import ArrowLeft from "@litespace/assets/ArrowLeft";
import cn from "classnames";
import dayjs from "@/lib/dayjs";
import EmptyUpcomingLessons from "@litespace/assets/EmptyUpcomingLessons";
import { Loader, LoadingError } from "@/components/Loading";
import { Void } from "@litespace/types";

type Props = {
  lessons: Array<{
    /**
     * Lesson start datetime in ISO UTC format.
     */
    start: string;
    tutorName: string | null;
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
  return (
    <div
      className={cn(
        "tw-border tw-border-transparent hover:tw-border-natural-100 tw-rounded-lg tw-p-6 tw-shadow-ls-x-small tw-bg-natural-50"
      )}
    >
      <Typography
        element="subtitle-2"
        weight="bold"
        className="tw-text-natural-950"
      >
        {intl("student-dashboard.upcoming-lessons.title")}
      </Typography>

      {error && retry && !loading ? (
        <div className="tw-w-full tw-h-96 tw-flex tw-justify-center tw-items-center">
          <LoadingError
            size="medium"
            error={intl("student-dashboard.error")}
            retry={retry}
          />
        </div>
      ) : null}

      {loading ? (
        <div className="tw-w-full tw-h-96 tw-flex tw-justify-center tw-items-center">
          <Loader size="medium" text={intl("student-dashboard.loading")} />
        </div>
      ) : null}

      {lessons && !error && !loading ? (
        <div>
          {lessons.length ? (
            <div className="tw-flex tw-flex-col tw-gap-4 tw-mt-4">
              {lessons.map((lesson) => (
                <Link
                  key={lesson.start}
                  to={lesson.url}
                  className="tw-flex tw-gap-2 tw-items-center"
                >
                  <div className="tw-bg-brand-500 tw-w-[43px] tw-h-[43px] tw-flex tw-justify-center tw-items-center tw-rounded-[4px]">
                    <Video className="[&>*]:tw-stroke-natural-50" />
                  </div>
                  <div className="tw-flex tw-flex-col tw-justify-between tw-self-stretch">
                    <Typography
                      element="caption"
                      weight="semibold"
                      className="tw-text-natural-950"
                    >
                      {dayjs(lesson.start).format("dddd - D MMMM YYYY")}
                    </Typography>
                    <Typography
                      element="tiny-text"
                      weight="regular"
                      className="tw-text-natural-600"
                    >
                      {lesson.tutorName}
                    </Typography>
                  </div>
                  <div className="tw-w-6 tw-h-6 tw-mr-auto">
                    <ArrowLeft className="[&>*]:tw-stroke-natural-950" />
                  </div>
                </Link>
              ))}

              <Link to={lessonsUrl} className="tw-inline-block tw-w-full">
                <Button size={ButtonSize.Tiny} className="tw-w-full">
                  <Typography
                    element="caption"
                    weight="semibold"
                    className="tw-text-natural-50"
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
    <div className={cn("tw-flex tw-flex-col tw-gap-[54px] tw-mt-6")}>
      <div className={cn("tw-flex tw-flex-col tw-items-center tw-gap-6")}>
        <EmptyUpcomingLessons />
        <Typography
          element="subtitle-1"
          weight="semibold"
          className="tw-text-natural-950"
        >
          {intl("student-dashboard.start-journey")}
        </Typography>
      </div>
      <Link to={tutorsUrl} className="tw-intline-block tw-w-full">
        <Button className="tw-w-full" size={ButtonSize.Tiny}>
          <Typography
            element="caption"
            weight="semibold"
            className="tw-text-natural-50"
          >
            {intl("student-dashboard.button.find-tutors")}
          </Typography>
        </Button>
      </Link>
    </div>
  );
};

export default UpcomingLessonsSummary;
