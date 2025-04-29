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
import { AvatarV2 } from "@/components/Avatar";
import { dayjs } from "@litespace/utils";
import { Tooltip } from "@/components/Tooltip";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { isEmpty } from "lodash";

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
  isTutor: boolean;
  scheduleUrl: string;
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
  isTutor,
  scheduleUrl,
  loading,
  error,
  retry,
}) => {
  const intl = useFormatMessage();
  const mq = useMediaQuery();
  return (
    <div
      className={cn(
        "border border-transparent hover:border-natural-100 rounded-lg p-4 sm:p-6 shadow-ls-x-small bg-natural-50 h-full flex flex-col"
      )}
    >
      <Typography
        tag="h2"
        className="text-natural-950 font-bold text-body sm:text-subtitle-2"
      >
        {intl("student-dashboard.upcoming-lessons.title")}
      </Typography>

      {error && retry && !loading ? (
        <div className="w-full h-96 flex justify-center items-center">
          <LoadingError
            size={mq.md ? "medium" : "small"}
            error={intl("student-dashboard.upcoming-lessons-summary.error")}
            retry={retry}
          />
        </div>
      ) : null}

      {loading ? (
        <div className="w-full h-96 flex justify-center items-center">
          <Loader
            size={mq.md ? "medium" : "small"}
            text={intl("student-dashboard.upcoming-lessons-summary.loading")}
          />
        </div>
      ) : null}

      {!isEmpty(lessons) && !error && !loading ? (
        <div className="flex flex-col gap-4 mt-4 flex-1">
          {lessons.map((lesson, i) => (
            <Link
              key={i}
              to={lesson.url}
              className="flex gap-2 items-center p-1"
            >
              <div className="w-[43px] h-[43px] rounded-[4px] overflow-hidden">
                <AvatarV2
                  alt={lesson.name}
                  src={lesson.imageUrl}
                  id={lesson.userId}
                  object="cover"
                />
              </div>
              <div className="flex flex-col justify-between self-stretch">
                <Typography
                  tag="span"
                  className="text-natural-950 text-caption font-semibold"
                >
                  {dayjs(lesson.start).format("dddd - D MMMM YYYY")}
                </Typography>
                <div className="flex justify-between">
                  <Tooltip
                    content={
                      <Typography tag="span" className="text-natuarl-950">
                        {lesson.name}
                      </Typography>
                    }
                  >
                    <div>
                      <Typography
                        tag="span"
                        className="block text-natural-600 me-1 truncate max-w-16 font-normal text-tiny"
                      >
                        {lesson.name}
                      </Typography>
                    </div>
                  </Tooltip>
                  <Typography
                    tag="span"
                    className="block text-natural-600 ms-[18px] text-tiny font-normal"
                  >
                    {dayjs(lesson.start).format("h:mm")}
                    {" - "}
                    {dayjs(lesson.end).format("h:mm a")}
                  </Typography>
                </div>
              </div>
              <div className="mr-auto">
                <ArrowLeft className="w-6 h-6 [&>*]:stroke-natural-950" />
              </div>
            </Link>
          ))}

          <Link to={lessonsUrl} className="inline-block w-full mt-auto">
            <Button size="large" className="w-full">
              <Typography
                tag="span"
                className="text-natural-50 font-semibold text-caption"
              >
                {intl("student-dashboard.button.show-all-lessons")}
              </Typography>
            </Button>
          </Link>
        </div>
      ) : null}

      {isEmpty(lessons) && !error && !loading ? (
        <EmptyUpcomingLessonsComponent
          tutorsUrl={tutorsUrl}
          isTutor={isTutor}
          scheduleUrl={scheduleUrl}
        />
      ) : null}
    </div>
  );
};

const EmptyUpcomingLessonsComponent: React.FC<{
  tutorsUrl: string;
  isTutor: boolean;
  scheduleUrl: string;
}> = ({ tutorsUrl, isTutor, scheduleUrl }) => {
  const intl = useFormatMessage();
  return (
    <div className={cn("flex flex-col gap-12 mt-8 lg:mt-4")}>
      <div className={cn("flex flex-col items-center gap-6")}>
        <EmptyUpcomingLessons className="w-[204px] h-[137px] lg:w-[228px] lg:h-[153px]" />
        <Typography
          tag="span"
          className="text-natural-950 font-bold sm:font-semibold text-caption sm:text-subtitle-1 text-center"
        >
          {isTutor
            ? intl("tutor-dashboard.upcoming-lessons.empty")
            : intl("student-dashboard.start-journey")}
        </Typography>
      </div>
      <Link
        to={isTutor ? scheduleUrl : tutorsUrl}
        className="intline-block w-full"
      >
        <Button className="w-full" size="large">
          <Typography
            tag="span"
            className="text-natural-50 font-semibold text-caption"
          >
            {isTutor
              ? intl("tutor-dashboard.upcoming-lessons.create-your-schedule")
              : intl("student-dashboard.button.find-tutors")}
          </Typography>
        </Button>
      </Link>
    </div>
  );
};

export default UpcomingLessonsSummary;
