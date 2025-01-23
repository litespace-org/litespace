import { Avatar } from "@/components/Avatar";
import { Button, ButtonSize, ButtonVariant } from "@/components/Button";
import { Loader, LoadingError } from "@/components/Loading";
import { Typography } from "@/components/Typography";
import { formatMinutes } from "@/components/utils";
import { useFormatMessage } from "@/hooks";
import dayjs from "@/lib/dayjs";
import EmptyLessons from "@litespace/assets/EmptyLesson2";
import { orUndefined } from "@litespace/utils/utils";
import { isEmpty } from "lodash";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import { BasePastLessonProps } from "@/components/Lessons/types";

export const PastLessonsTable: React.FC<BasePastLessonProps> = ({
  lessons,
  tutorsRoute,
  isTutor,
  loading,
  error,
  sendingMessage,
  onRebook,
  onSendMessage,
  retry,
}) => {
  const intl = useFormatMessage();

  const columns = useMemo(() => {
    const date = intl("student-dashboard.table.date");
    const duration = intl("student-dashboard.table.duration");
    const tutor = intl("student-dashboard.table.tutor");
    const student = intl("tutor-dashboard.table.student");

    if (isTutor) return [date, duration, student];

    return [date, duration, tutor];
  }, [intl, isTutor]);

  if (loading)
    return (
      <div className="tw-flex tw-items-center tw-justify-center tw-w-full tw-h-40">
        <Loader
          size="medium"
          text={
            isTutor
              ? intl("tutor-dashboard.past-lessons.loading")
              : intl("student-dashboard.past-lessons.loading")
          }
        />
      </div>
    );

  if (error && retry)
    return (
      <div className="tw-flex tw-items-center tw-justify-center tw-w-full tw-h-40">
        <LoadingError
          size="medium"
          error={
            isTutor
              ? intl("tutor-dashboard.past-lessons.error")
              : intl("student-dashboard.past-lessons.error")
          }
          retry={retry}
        />
      </div>
    );

  return (
    <div>
      <div className="tw-grid tw-grid-cols-4 tw-pb-2 tw-border-b tw-border-natural-500 tw-mb-6">
        {columns.map((column) => (
          <div key={column} className="tw-text-start tw-col-span-1">
            <Typography element="caption" className="tw-text-natural-600">
              {column}
            </Typography>
          </div>
        ))}
      </div>

      {isEmpty(lessons) ? (
        <div
          className={cn(
            "tw-flex tw-justify-center tw-items-center",
            isTutor ? "tw-flex-col-reverse tw-gap-6" : "tw-gap-20"
          )}
        >
          <div className="tw-flex tw-flex-col tw-items-center tw-gap-6">
            <Typography
              element={isTutor ? "subtitle-1" : "h4"}
              weight="semibold"
              className="tw-text-natural-950"
            >
              {isTutor
                ? intl("tutor-dashboard.past-lessons.empty")
                : intl("student-dashboard.table.empty")}
            </Typography>
            {!isTutor ? (
              <Link to={tutorsRoute}>
                <Button size={ButtonSize.Small}>
                  {intl("student-dashboard.table.search-tutors")}
                </Button>
              </Link>
            ) : null}
          </div>
          <div>
            <EmptyLessons />
          </div>
        </div>
      ) : (
        <div className="tw-grid tw-grid-cols-4">
          {lessons.map((lesson) => (
            <React.Fragment key={lesson.id}>
              <div className="tw-text-start">
                <Typography element="body" className="tw-text-natural-950">
                  {dayjs(lesson.start).format("dddd - DD MMMM YYYY")}
                </Typography>
              </div>
              <div className="tw-text-start">
                <Typography element="body" className="tw-text-natural-950">
                  {formatMinutes(lesson.duration)}
                </Typography>
              </div>
              <div className="tw-mb-4">
                <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                  <div className="tw-w-10 tw-h-10 tw-rounded-lg tw-overflow-hidden">
                    <Avatar
                      src={orUndefined(lesson.otherMember.imageUrl)}
                      alt={orUndefined(lesson.otherMember.name)}
                      seed={lesson.otherMember.id.toString()}
                    />
                  </div>
                  <Typography className="tw-text-natural-950">
                    {lesson.otherMember.name}
                  </Typography>
                </div>
              </div>
              <div>
                <Button
                  onClick={() => {
                    if (onRebook && !isTutor)
                      return onRebook(lesson.otherMember.id);

                    if (onSendMessage && isTutor)
                      return onSendMessage(lesson.id, [
                        lesson.otherMember.id,
                        lesson.currentMember,
                      ]);
                  }}
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Tiny}
                  disabled={!!sendingMessage}
                  loading={sendingMessage === lesson.id}
                >
                  {isTutor
                    ? intl("tutor-dashboard.table.send-message")
                    : intl("student-dashboard.table.rebook")}
                </Button>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
