import { Button } from "@/components/Button";
import { Loader, LoadingError } from "@/components/Loading";
import { Typography } from "@/components/Typography";

import dayjs from "@/lib/dayjs";
import { useFormatMessage } from "@/hooks";

import React from "react";
import { Link } from "react-router-dom";
import { isEmpty } from "lodash";
import cn from "classnames";

import EmptyLessons from "@litespace/assets/EmptyLessons";
import AddCalendarSVG from "@litespace/assets/CalendarAdd";
import SendSVG from "@litespace/assets/Send2";
import { Void } from "@litespace/types";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/utils";
import { Tooltip } from "@/components/Tooltip";
import { BasePastLessonProps } from "@/components/Lessons/types";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

export type Props = BasePastLessonProps & {
  /**
   * Function used to fetch more data.
   */
  more?: Void;
  /**
   * toggle the more button visibility
   */
  hasMore?: boolean;
  /**
   * More button loading indicator.
   */
  loadingMore?: boolean;
};

export const PastLessonsSummary: React.FC<Props> = ({
  lessons,
  tutorsRoute,
  isTutor,
  loading,
  error,
  onRebook,
  onSendMessage,
  sendingMessage,
  retry,
  more,
  hasMore,
  loadingMore,
}) => {
  const intl = useFormatMessage();
  const { md } = useMediaQuery();

  return (
    <div
      className={cn(
        "border border-transparent hover:border-natural-100 h-min-96",
        "rounded-lg p-4 shadow-ls-x-small bg-natural-50"
      )}
    >
      <Typography
        tag="h1"
        className="text-natural-950 mb-4 text-base font-bold"
      >
        {isTutor
          ? intl("tutor-dashboard.past-lessons.title")
          : intl("student-dashboard.past-lessons.title")}
      </Typography>

      {loading && !error ? (
        <div className="mb-[135px] mt-[112px]">
          <Loader
            size={md ? "medium" : "small"}
            text={
              isTutor
                ? intl("tutor-dashboard.past-lessons.loading")
                : intl("student-dashboard.past-lessons.loading")
            }
          />
        </div>
      ) : null}

      {error && retry && !loading ? (
        <div className="mt-[72px] mb-[76px]">
          <LoadingError
            size={md ? "medium" : "small"}
            error={
              isTutor
                ? intl("tutor-dashboard.past-lessons.error")
                : intl("student-dashboard.past-lessons.error")
            }
            retry={retry}
          />
        </div>
      ) : null}

      {isEmpty(lessons) && !loading && !error ? (
        <Empty isTutor={isTutor} tutorsRoute={tutorsRoute} />
      ) : null}

      {!isEmpty(lessons) && !loading && !error ? (
        <div className="flex flex-col gap-4">
          {lessons.map((lesson) => (
            <Row
              key={lesson.id}
              userId={lesson.otherMember.id}
              name={lesson.otherMember.name}
              imageUrl={lesson.otherMember.imageUrl}
              start={lesson.start}
              isTutor={!!isTutor}
              buttonDisabled={!!sendingMessage}
              buttonLoading={sendingMessage === lesson.id}
              onClick={() => {
                if (onRebook && !isTutor)
                  return onRebook(lesson.otherMember.id);

                if (onSendMessage && isTutor)
                  return onSendMessage(lesson.id, [
                    lesson.otherMember.id,
                    lesson.currentMember,
                  ]);
              }}
            />
          ))}

          {more && hasMore ? (
            <Button
              size="large"
              className="inline-block w-full"
              loading={loadingMore}
              disabled={loadingMore}
              onClick={more}
            >
              <Typography
                tag="span"
                className="text-natural-50 text-caption font-semibold"
              >
                {intl("global.labels.more")}
              </Typography>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

type RowProps = {
  /**
   * Lesson start datetime in ISO UTC format.
   */
  start: string;
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
   * Url to navigate to when the row is clicked
   */
  url?: string;
  /**
   * the icon on the left button changes according to this info
   */
  isTutor: boolean;
  /**
   * onclick the left button
   */
  onClick: Void;
  /**
   * the send message buttton becomes to disabled if this's true
   */
  buttonDisabled: boolean;
  buttonLoading: boolean;
};

export const Row: React.FC<RowProps> = ({
  start,
  name,
  userId,
  imageUrl,
  url,
  onClick,
  isTutor,
  buttonDisabled,
  buttonLoading,
}) => {
  return (
    <Link
      key={start}
      to={url ? url : ""}
      className={cn("flex gap-2 items-center", {
        "cursor-default": !url,
      })}
    >
      <div className="w-[43px] h-[43px] rounded-[4px] overflow-hidden">
        <Avatar
          alt={orUndefined(name)}
          src={orUndefined(imageUrl)}
          seed={userId?.toString()}
        />
      </div>
      <div className="flex flex-col justify-between self-stretch">
        <Typography
          tag="span"
          className="text-natural-950 text-tiny md:text-body font-semibold"
        >
          {dayjs(start).format("dddd - D MMMM YYYY")}
        </Typography>
        <div className="flex justify-between">
          <Tooltip
            content={
              <Typography tag="span" className="text-natuarl-950">
                {name}
              </Typography>
            }
          >
            <div>
              <Typography
                tag="span"
                className="block text-natural-600 me-1 truncate max-w-16 text-tiny font-normal"
              >
                {name}
              </Typography>
            </div>
          </Tooltip>
          <Typography
            tag="span"
            className="block text-natural-600 ms-[18px] text-tiny font-normal"
          >
            {dayjs(start).format("h:mm a")}
          </Typography>
        </div>
      </div>
      <div className="mr-auto">
        <Button
          size="large"
          className="flex items-center justify-center bg-brand-700 rounded-lg !px-2"
          onClick={onClick}
          disabled={buttonDisabled}
          loading={buttonLoading}
        >
          {isTutor ? (
            <SendSVG className="[&>*]:stroke-natural-50 w-6 h-6" />
          ) : (
            <AddCalendarSVG className="[&>*]:stroke-natural-50 w-4 h-4" />
          )}
        </Button>
      </div>
    </Link>
  );
};

const Empty: React.FC<{ isTutor?: boolean; tutorsRoute: string }> = ({
  isTutor,
  tutorsRoute,
}) => {
  const intl = useFormatMessage();
  return (
    <div className={cn("flex flex-col gap-3 justify-center items-center")}>
      <div className="flex flex-col items-center gap-6 my-8">
        <EmptyLessons className="w-[204px] h-[130px]" />

        <Typography
          tag="span"
          className="text-natural-950 text-caption text-bold"
        >
          {isTutor
            ? intl("tutor-dashboard.past-lessons.empty")
            : intl("student-dashboard.table.empty")}
        </Typography>
      </div>

      {!isTutor ? (
        <Link to={tutorsRoute} className="w-full">
          <Button size="large" className="w-full">
            <Typography
              tag="span"
              className="text-neutral-50 text-caption font-bold"
            >
              {intl("student-dashboard.table.search-tutors")}
            </Typography>
          </Button>
        </Link>
      ) : null}
    </div>
  );
};
