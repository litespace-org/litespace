import { Avatar } from "@/components/Avatar";
import { Button, ButtonSize } from "@/components/Button";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import dayjs from "@/lib/dayjs";
import { Void } from "@litespace/types";
import cn from "classnames";
import React, { useEffect, useMemo, useState } from "react";
import More from "@litespace/assets/More";
import { Menu, type MenuAction } from "@/components/Menu";
import CalendarEdit from "@litespace/assets/CalendarEdit";
import CalendarRemove from "@litespace/assets/CalendarRemove";
import CheckCircle from "@litespace/assets/CheckCircle";

export type Props = {
  start: string;
  duration: number;
  canceled: "tutor" | "student" | null;
  member: {
    id: number;
    name: string | null;
    image: string | undefined;
    /**
     * @note role shall be `student` when the current user is tutor and vice versa
     */
    role: "tutor" | "student";
  };
  onRebook: Void;
  onJoin: Void;
  onCancel: Void;
  onSendMsg: Void;
};

export const LessonCard: React.FC<Props> = ({
  start,
  duration,
  member,
  canceled,
  onJoin,
  onCancel,
  onRebook,
  onSendMsg,
}) => {
  const intl = useFormatMessage();
  const end = dayjs(start).add(duration, "minutes");

  // for code readability
  const currentUserRole = useMemo(() => {
    return member.role === "student" ? "tutor" : "student";
  }, [member]);

  const [title, setTitle] = useState<string | undefined>(() => {
    const now = dayjs();
    // canceled by the current user
    if (canceled === currentUserRole) return intl("lessons.canceled-by-you");

    // canceled by the tutor and the current user is the student
    if (canceled === "tutor") return intl("lessons.canceled-by-tutor");

    // canceled by the student and the current user is the tutor
    if (canceled === "student") return intl("lessons.canceled-by-student");

    // before the lesson started
    if (!canceled && now.isBefore(start, "second"))
      return intl("lessons.time-to-join", {
        value: dayjs(start).fromNow(true),
      });

    // at first 3 minutes
    if (
      !canceled &&
      now.isBetween(start, dayjs(start).add(3, "minutes"), "seconds", "[]")
    )
      return intl("lessons.can-join-now");

    // first half of the lesson
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

    // second half
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

    // after finish
    if (!canceled && now.isAfter(end, "seconds")) return intl("lessons.end");
  });

  const canJoin = useMemo(() => {
    return dayjs().isBetween(
      dayjs(start).subtract(10, "minutes"),
      end,
      "minutes",
      "[]"
    );
  }, [end, start]);

  const canRebook = useMemo(() => {
    return currentUserRole === "student" && (dayjs().isAfter(end) || canceled);
  }, [canceled, end, currentUserRole]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs();
      // canceled by the cur user
      if (canceled === currentUserRole)
        setTitle(intl("lessons.canceled-by-you"));

      // canceled by the tutor and the cur user is the student
      if (canceled === "tutor") setTitle(intl("lessons.canceled-by-tutor"));

      // canceled by the student and the cur user is the tutor
      if (canceled === "student") setTitle(intl("lessons.canceled-by-student"));

      // before start of lesson
      if (!canceled && now.isBefore(start, "second"))
        setTitle(
          intl("lessons.time-to-join", {
            value: dayjs(start).fromNow(true),
            finish: null,
          })
        );

      // at first 3 minutes of lessons
      if (
        !canceled &&
        now.isBetween(start, dayjs(start).add(3, "minutes"), "seconds", "[]")
      )
        setTitle(intl("lessons.can-join-now"));

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
        setTitle(
          intl("lessons.time-from-start", {
            value: dayjs().diff(start, "minute"),
          })
        );

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
        setTitle(
          intl("lessons.time-to-end-lesson", {
            value: dayjs(end).fromNow(true),
          })
        );

      // after finish of the lesson
      if (!canceled && now.isAfter(end)) setTitle("lessons.end");
    }, 60_000);
    return () => clearInterval(interval);
  }, [start, end, canceled, title, intl, duration, currentUserRole]);

  const actions: MenuAction[] = useMemo(
    () =>
      currentUserRole === "student"
        ? [
            // Student related actions
            {
              label: intl("lessons.menu.edit"),
              icon: <CalendarEdit />,
              onClick: () => console.log("edit"),
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
    [intl, onCancel, currentUserRole]
  );

  const mainBtnHandler = useMemo(() => {
    if (!canceled) return onJoin;
    if (currentUserRole === "student") return onRebook;
    else return onSendMsg;
  }, [canceled, onJoin, onRebook, onSendMsg]);

  const mainBtnText = useMemo(() => {
    if (!canceled) return intl("lessons.button.join");
    if (currentUserRole === "student") return intl("lessons.button.rebook");
    else return intl("lessons.button.send-message");
  }, [canceled, currentUserRole]);

  const button = (
    <Button
      size={ButtonSize.Tiny}
      className={cn(
        "tw-w-full tw-text-[14px] tw-leading-[21px] tw-font-semibold tw-mt-auto"
      )}
      disabled={!canJoin && !canRebook}
      onClick={mainBtnHandler}
    >
      {mainBtnText}
    </Button>
  );

  return (
    <div
      className={cn(
        "tw-flex tw-flex-col tw-items-stretch tw-gap-4 tw-p-6 tw-bg-natural-50",
        "tw-border tw-rounded-2xl tw-border-natural-200 tw-shadow-lesson-upcoming-card"
      )}
    >
      <div className="tw-flex tw-justify-between tw-items-stretch tw-gap-6">
        {dayjs().isAfter(end) ? (
          <div className="tw-flex tw-gap-2 tw-items-center">
            <CheckCircle className="[&>*]:tw-stroke-brand-700" />
            <Typography
              element="caption"
              weight="semibold"
              className={cn("tw-text-brand-700 tw-line-clamp-1 tw-truncate")}
            >
              {intl("lessons.end")}
            </Typography>
          </div>
        ) : (
          <>
            <Typography
              element="caption"
              weight="semibold"
              className={cn(
                "tw-line-clamp-1",
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
              src={member.image}
              seed={member.id.toString()}
              alt={member.image}
            />
          </div>
          <div className="tw-flex tw-flex-col tw-gap-1">
            <Typography
              element="caption"
              weight="bold"
              className="tw-text-[14px] tw-leading-[21px] tw-text-natural-950"
            >
              {member.name}
            </Typography>
            <Typography
              element="tiny-text"
              weight="regular"
              className="tw-text-natural-700"
            >
              {dayjs(start).format("dddd، D MMMM")}
            </Typography>
            <Typography
              element="tiny-text"
              weight="regular"
              className="tw-text-natural-700 tw-flex tw-items-center"
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
