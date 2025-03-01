import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Loader, LoadingError } from "@/components/Loading";
import { Typography } from "@/components/Typography";
import { formatMinutes } from "@/components/utils";
import { useFormatMessage } from "@/hooks";
import dayjs from "@/lib/dayjs";
import EmptyLessons from "@litespace/assets/EmptyLessons";
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
      <div className="flex items-center justify-center w-full h-40">
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
      <div className="flex items-center justify-center w-full h-40">
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
      <div className="grid grid-cols-4 pb-2 border-b border-natural-500 mb-6">
        {columns.map((column) => (
          <div key={column} className="text-start col-span-1">
            <Typography tag="span" className="text-natural-600 text-caption">
              {column}
            </Typography>
          </div>
        ))}
      </div>

      {isEmpty(lessons) ? (
        <div
          className={cn(
            "flex justify-center items-center",
            isTutor ? "flex-col-reverse gap-6" : "gap-20"
          )}
        >
          <div className="flex flex-col items-center gap-6">
            <Typography
              tag="span"
              className={cn("text-natural-950 font-semibold", {
                "text-subtitle-1": isTutor,
                "text-h4": !isTutor,
              })}
            >
              {isTutor
                ? intl("tutor-dashboard.past-lessons.empty")
                : intl("student-dashboard.table.empty")}
            </Typography>
            {!isTutor ? (
              <Link to={tutorsRoute}>
                <Button size={"medium"}>
                  {intl("student-dashboard.table.search-tutors")}
                </Button>
              </Link>
            ) : null}
          </div>
          <div>
            <EmptyLessons className="w-[282px] h-[182px]" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4">
          {lessons.map((lesson) => (
            <React.Fragment key={lesson.id}>
              <div className="text-start">
                <Typography tag="span" className="text-natural-950 text-body">
                  {dayjs(lesson.start).format("dddd - DD MMMM YYYY")}
                </Typography>
              </div>
              <div className="text-start">
                <Typography tag="span" className="text-natural-950 text-body">
                  {formatMinutes(lesson.duration)}
                </Typography>
              </div>
              <div className="mb-4">
                <div className="flex flex-row gap-2 items-center">
                  <div className="w-10 h-10 rounded-lg overflow-hidden">
                    <Avatar
                      src={orUndefined(lesson.otherMember.imageUrl)}
                      alt={orUndefined(lesson.otherMember.name)}
                      seed={lesson.otherMember.id.toString()}
                    />
                  </div>
                  <Typography tag="span" className="text-natural-950">
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
                  variant={"secondary"}
                  size={"small"}
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
