import { Avatar } from "@/components/Avatar";
import { Button, ButtonSize, ButtonVariant } from "@/components/Button";
import { Loader, LoadingError } from "@/components/Loading";
import { Typography } from "@/components/Typography";
import { formatMinutes } from "@/components/utils";
import { useFormatMessage } from "@/hooks";
import dayjs from "@/lib/dayjs";
import EmptyLessons from "@litespace/assets/EmptyLesson2";
import { orUndefined } from "@litespace/sol/utils";
import { Void } from "@litespace/types";
import { isEmpty } from "lodash";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

export type Props = {
  lessons: Array<{
    id: number;
    start: string;
    duration: number;
    /**
     * Current user id
     */
    currentMember: number;
    /**
     * Student in case user is tutor and vice versa
     */
    otherMember: {
      id: number;
      name: string | null;
      imageUrl: string | null;
    };
  }>;
  tutorsRoute: string;
  /**
   * `true` in case the current user is a tutor or tutor manager.
   */
  isTutor?: boolean;
  loading?: boolean;
  error?: boolean;
  /**
   * The lesson with the same id as `sendingMessage` will have the loading button state.
   */
  sendingMessage?: number;
  /**
   * State of sending message disable present in the end of each row of the table.
   */
  onRebook?: (tutorId: number) => void;
  onSendMessage?: (members: number[]) => void;
  retry?: Void;
};

export const PastLessonsTable: React.FC<Props> = ({
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
        <div className="tw-flex tw-flex-row tw-justify-center tw-items-center tw-gap-20">
          <div className="tw-flex tw-flex-col tw-items-center tw-gap-6">
            <Typography element="h4" weight="semibold">
              {intl("student-dashboard.table.empty")}
            </Typography>
            <Link to={tutorsRoute}>
              <Button size={ButtonSize.Small}>
                {intl("student-dashboard.table.search-tutors")}
              </Button>
            </Link>
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
                      return onSendMessage([
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
