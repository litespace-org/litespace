import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import dayjs from "@/lib/dayjs";
import { Void } from "@litespace/types";
import cn from "classnames";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import More from "@litespace/assets/More";
import { Menu, type MenuAction } from "@/components/Menu";
import CalendarEdit from "@litespace/assets/CalendarEdit";
import CalendarRemove from "@litespace/assets/CalendarRemove";
import CheckCircle from "@litespace/assets/CheckCircle";
import { orUndefined } from "@litespace/utils";

export type Props = {
  start: string;
  duration: number;
  canceled: "tutor" | "student" | null;
  member: {
    id: number;
    name: string | null;
    image: string | null;
    /**
     * @note role shall be `student` when the current user is tutor and vice versa
     */
    role: "tutor" | "student";
  };
  sendingMessage: boolean;
  disabled: boolean;
  onRebook: Void;
  onJoin: Void;
  onEdit: Void;
  onCancel: Void;
  onSendMsg: Void;
};

export const LessonCard: React.FC<Props> = ({
  start,
  duration,
  member,
  canceled,
  sendingMessage,
  disabled,
  onJoin,
  onCancel,
  onRebook,
  onEdit,
  onSendMsg,
}) => {
  const intl = useFormatMessage();
  const end = useMemo(
    () => dayjs(start).add(duration, "minutes"),
    [duration, start]
  );

  // for code readability
  const currentUserRole = useMemo(() => {
    return member.role === "student" ? "tutor" : "student";
  }, [member]);

  const getTitle = useCallback(() => {
    const now = dayjs();

    // canceled by the cur user
    if (canceled === currentUserRole) return intl("lessons.canceled-by-you");

    // canceled by the tutor and the cur user is the student
    if (canceled === "tutor") return intl("lessons.canceled-by-tutor");

    // canceled by the student and the cur user is the tutor
    if (canceled === "student") return intl("lessons.canceled-by-student");

    // before start of lesson
    if (!canceled && now.isBefore(start, "second"))
      return intl("lessons.time-to-join", {
        value: dayjs(start).fromNow(true),
        finish: null,
      });

    // at first 3 minutes of lessons
    if (
      !canceled &&
      now.isBetween(start, dayjs(start).add(3, "minutes"), "seconds", "[]")
    )
      return intl("lessons.can-join-now");

    // at the first half of the lesson
    if (
      !canceled &&
      now.isBetween(
        dayjs(start).add(3, "minutes"),
        dayjs(start).add(duration / 2, "minutes"),
        "seconds",
        "(]"
      )
    )
      return intl("lessons.time-from-start", {
        value: dayjs().diff(start, "minute"),
      });

    // at the second half of the lesson
    if (
      !canceled &&
      now.isBetween(
        dayjs(start).add(duration / 2, "minutes"),
        end,
        "seconds",
        "[]"
      )
    )
      return intl("lessons.time-to-end-lesson", {
        value: dayjs(end).fromNow(true),
      });

    // after finish of the lesson
    if (!canceled && now.isAfter(end)) return intl("lessons.end");
  }, [canceled, currentUserRole, intl, start, duration, end]);

  const [title, setTitle] = useState<string | undefined>(getTitle());

  useEffect(() => {
    const interval = setInterval(() => {
      const title = getTitle();
      if (title) setTitle(title);
    }, 60_000);
    return () => clearInterval(interval);
  }, [getTitle]);

  const actions: MenuAction[] = useMemo(
    () =>
      currentUserRole === "student"
        ? [
            // Student related actions
            {
              label: intl("lessons.menu.edit"),
              icon: <CalendarEdit />,
              onClick: () => onEdit(),
            },
            {
              label: intl("lessons.menu.cancel"),
              icon: <CalendarRemove />,
              onClick: () => onCancel(),
            },
          ]
        : [
            // Tutor related actions
            {
              label: intl("lessons.menu.cancel"),
              icon: <CalendarRemove />,
              onClick: () => onCancel(),
            },
          ],
    [intl, onCancel, onEdit, currentUserRole]
  );

  const action = useMemo(() => {
    const ended = end.isBefore(dayjs());
    if (currentUserRole === "student" && (ended || canceled))
      return {
        label: intl("lessons.button.rebook"),
        onClick: onRebook,
      };
    if (currentUserRole === "tutor" && (ended || canceled))
      return {
        label: intl("lessons.button.send-message"),
        onClick: onSendMsg,
      };
    return {
      label: intl("lessons.button.join"),
      onClick: onJoin,
    };
  }, [canceled, currentUserRole, end, intl, onJoin, onRebook, onSendMsg]);

  const button = (
    <Button
      size="large"
      className={cn("tw-w-full tw-mt-auto")}
      disabled={disabled}
      onClick={action.onClick}
      loading={sendingMessage}
    >
      <Typography
        tag="label"
        className="tw-text-natural-50 tw-text-sm tw-font-semibold"
      >
        {action.label}
      </Typography>
    </Button>
  );

  return (
    <div
      className={cn(
        "tw-flex tw-flex-col tw-items-stretch tw-gap-4 tw-p-4 md:tw-p-6 tw-bg-natural-50",
        "tw-border tw-rounded-2xl tw-border-natural-200 tw-shadow-mobile-lesson-upcoming-card md:tw-shadow-lesson-upcoming-card"
      )}
    >
      <div className="tw-flex tw-justify-between tw-items-stretch tw-gap-6">
        {dayjs().isAfter(end) ? (
          <div className="tw-flex tw-gap-2 tw-items-center">
            <CheckCircle className="[&>*]:tw-stroke-brand-700" />
            <Typography
              tag="label"
              className={cn("tw-text-brand-700 tw-line-clamp-1 tw-truncate tw-text-sm tw-font-semibold")}
            >
              {intl("lessons.end")}
            </Typography>
          </div>
        ) : (
          <>
            <Typography
              tag="label"
              className={cn(
                "tw-line-clamp-1 tw-text-sm tw-font-semibold",
                !canceled ? "tw-text-brand-700" : "tw-text-destructive-600"
              )}
            >
              {title}
            </Typography>
            {!canceled ? (
              <Menu actions={actions}>
                <More className="[&>*]:tw-fill-natural-800" />
              </Menu>
            ) : null}
          </>
        )}
      </div>
      <div className="tw-flex tw-flex-col tw-gap-6">
        <div className="tw-flex tw-gap-2">
          <div className="tw-w-[65px] tw-h-[65px] tw-rounded-full tw-overflow-hidden">
            <Avatar
              src={orUndefined(member.image)}
              alt={orUndefined(member.name)}
              seed={member.id.toString()}
            />
          </div>
          <div className="tw-flex tw-flex-col tw-gap-1">
            <Typography
              tag="label"
              className="tw-text-sm tw-font-bold tw-text-[14px] tw-leading-[21px] tw-text-natural-950"
            >
              {member.name}
            </Typography>
            <Typography
              tag="label"
              className="tw-text-natural-700 tw-text-xs tw-font-normal"
            >
              {dayjs(start).format("dddd، D MMMM")}
            </Typography>
            <Typography
              tag="label"
              className="tw-text-natural-700 tw-flex tw-items-center tw-text-xs tw-font-normal"
            >
              {dayjs(start).format("h:mm a")}
              {" - "}
              {dayjs(start).add(duration, "minutes").format("h:mm a")}
            </Typography>
          </div>
        </div>
        {button}
      </div>
    </div>
  );
};

export default LessonCard;
