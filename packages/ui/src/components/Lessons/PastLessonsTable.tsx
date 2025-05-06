import { AvatarV2 } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Loading, LoadingError } from "@/components/Loading";
import { Typography } from "@/components/Typography";
import { formatMinutes } from "@/components/utils";
import { useFormatMessage } from "@/hooks";
import dayjs from "@/lib/dayjs";
import EmptyLessons from "@litespace/assets/EmptyLessons";
import AddCalendarSVG from "@litespace/assets/CalendarAdd";
import SendSVG from "@litespace/assets/Send2";
import { isEmpty } from "lodash";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import { BasePastLessonProps } from "@/components/Lessons/types";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

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
  const { lg, xl } = useMediaQuery();

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
        <Loading
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
      <div
        className={cn(
          "grid grid-cols-12 pb-2 border-b border-natural-500",
          isEmpty(lessons) ? "mb-8" : "mb-4 lg:mb-6"
        )}
      >
        {columns.map((column, idx) => (
          <div
            key={column}
            className={cn(
              "text-start",
              idx === 1 ? "col-span-2" : "col-span-5"
            )}
          >
            <Typography
              tag="span"
              className="text-natural-600 text-caption font-normal"
            >
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
            <EmptyLessons className="w-[204px] h-[130px] lg:w-[282px] lg:h-[182px]" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 items-center gap-y-4">
          {lessons.map((lesson) => (
            <React.Fragment key={lesson.id}>
              <div className="text-start col-span-5">
                <Typography
                  tag="span"
                  className="text-natural-950 text-body font-normal"
                >
                  {dayjs(lesson.start).format("dddd - DD MMMM YYYY")}
                </Typography>
              </div>
              <div className="text-start col-span-2">
                <Typography
                  tag="span"
                  className="text-natural-950 text-body font-normal"
                >
                  {formatMinutes(lesson.duration)}
                </Typography>
              </div>
              <div
                className={cn(
                  "flex flex-row gap-2 items-center",
                  lg && !xl ? "col-span-4" : "col-span-3"
                )}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden">
                  <AvatarV2
                    src={lesson.otherMember.imageUrl}
                    alt={lesson.otherMember.name}
                    id={lesson.otherMember.id}
                    object="cover"
                  />
                </div>
                <Typography tag="span" className="text-natural-950">
                  {lesson.otherMember.name}
                </Typography>
              </div>
              <div
                className={cn(
                  "justify-self-end",
                  lg && !xl ? "col-span-1" : "col-span-2"
                )}
              >
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
                  variant={lg && !xl ? "primary" : "secondary"}
                  size="large"
                  disabled={!!sendingMessage}
                  loading={sendingMessage === lesson.id}
                  className={cn({ "!px-2": lg && !xl })}
                >
                  {!lg || xl ? (
                    <Typography
                      tag="span"
                      className="text-body text-brand-700 font-medium"
                    >
                      {isTutor
                        ? intl("tutor-dashboard.table.send-message")
                        : intl("student-dashboard.table.rebook")}
                    </Typography>
                  ) : null}

                  {lg && !xl && isTutor ? (
                    <SendSVG className="[&>*]:stroke-natural-50 w-6 h-6" />
                  ) : null}

                  {lg && !xl && !isTutor ? (
                    <AddCalendarSVG
                      className="[&>*]:stroke-natural-50"
                      width={16}
                      height={16}
                    />
                  ) : null}
                </Button>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
