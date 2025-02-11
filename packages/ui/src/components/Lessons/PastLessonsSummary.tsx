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

  return (
    <div
      className={cn(
        "tw-border tw-border-transparent hover:tw-border-natural-100 tw-h-min-96",
        "tw-rounded-lg tw-p-4 tw-shadow-ls-x-small tw-bg-natural-50"
      )}
    >
      <Typography
        element="body"
        weight="bold"
        className="text-natural-950 tw-mb-4"
      >
        {isTutor
          ? intl("tutor-dashboard.past-lessons.title")
          : intl("student-dashboard.past-lessons.title")}
      </Typography>

      {loading && !error ? (
        <div className="tw-mb-[135px] tw-mt-[112px]">
          <Loader
            size="medium"
            text={
              isTutor
                ? intl("tutor-dashboard.past-lessons.loading")
                : intl("student-dashboard.past-lessons.loading")
            }
          />
        </div>
      ) : null}

      {error && retry && !loading ? (
        <div className="tw-mt-[72px] tw-mb-[76px]">
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
      ) : null}

      {isEmpty(lessons) && !loading && !error ? (
        <Empty isTutor={isTutor} tutorsRoute={tutorsRoute} />
      ) : null}

      {!isEmpty(lessons) && !loading && !error ? (
        <div className="tw-flex tw-flex-col tw-gap-4">
          {lessons.map((lesson) => (
            <Row
              key={lesson.id}
              userId={lesson.otherMember.id}
              name={lesson.otherMember.name}
              imageUrl={lesson.otherMember.imageUrl}
              start={lesson.start}
              end={dayjs(lesson.start)
                .add(lesson.duration, "minutes")
                .toISOString()}
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
              className="tw-inline-block tw-w-full"
              loading={loadingMore}
              disabled={loadingMore}
              onClick={more}
            >
              <Typography
                element="caption"
                weight="semibold"
                className="tw-text-natural-50"
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
  end,
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
      className={cn("tw-flex tw-gap-2 tw-items-center", {
        "tw-cursor-default": !url,
      })}
    >
      <div className="tw-w-[43px] tw-h-[43px] tw-rounded-[4px] tw-overflow-hidden">
        <Avatar
          alt={orUndefined(name)}
          src={orUndefined(imageUrl)}
          seed={userId?.toString()}
        />
      </div>
      <div className="tw-flex tw-flex-col tw-justify-between tw-self-stretch">
        <Typography
          element="caption"
          weight="semibold"
          className="tw-text-natural-950"
        >
          {dayjs(start).format("dddd - D MMMM YYYY")}
        </Typography>
        <div className="tw-flex tw-justify-between">
          <Tooltip
            content={
              <Typography className="tw-text-natuarl-950">{name}</Typography>
            }
          >
            <div>
              <Typography
                element="tiny-text"
                weight="regular"
                className="tw-block tw-text-natural-600 tw-me-1 tw-truncate tw-max-w-16"
              >
                {name}
              </Typography>
            </div>
          </Tooltip>
          <Typography
            element="tiny-text"
            weight="regular"
            className="tw-block tw-text-natural-600 tw-ms-[18px]"
          >
            {dayjs(start).format("h:mm")}
            {" - "}
            {dayjs(end).format("h:mm a")}
          </Typography>
        </div>
      </div>
      <div className="tw-mr-auto">
        <Button
          size="medium"
          className="tw-flex tw-items-center tw-justify-center tw-bg-brand-700 tw-rounded-lg"
          onClick={onClick}
          disabled={buttonDisabled}
          loading={buttonLoading}
        >
          {isTutor ? (
            <SendSVG
              className="[&>*]:tw-stroke-natural-50"
              width={16}
              height={16}
            />
          ) : (
            <AddCalendarSVG
              className="[&>*]:tw-stroke-natural-50"
              width={16}
              height={16}
            />
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
    <div
      className={cn(
        "tw-flex tw-flex-col tw-gap-3 tw-justify-center tw-items-center"
      )}
    >
      <div className="tw-flex tw-flex-col tw-items-center tw-gap-6 tw-my-8">
        <EmptyLessons className="tw-w-[204px] tw-h-[130px]" />

        <Typography
          element="caption"
          weight="bold"
          className="tw-text-natural-950"
        >
          {isTutor
            ? intl("tutor-dashboard.past-lessons.empty")
            : intl("student-dashboard.table.empty")}
        </Typography>
      </div>

      {!isTutor ? (
        <Link to={tutorsRoute} className="tw-w-full">
          <Button size="large" className="tw-w-full">
            <Typography
              element="caption"
              weight="bold"
              className="tw-text-neutral-50"
            >
              {intl("student-dashboard.table.search-tutors")}
            </Typography>
          </Button>
        </Link>
      ) : null}
    </div>
  );
};
