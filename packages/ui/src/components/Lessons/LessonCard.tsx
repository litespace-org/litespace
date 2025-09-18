import { AvatarV2 } from "@/components/Avatar";
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
import Calendar from "@litespace/assets/Calendar";
import AllMessages from "@litespace/assets/AllMessages";
import Clock from "@litespace/assets/Clock";

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
    topics: Array<string>;
    level: string;
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
      type="natural"
      size="large"
      className={cn("w-full mt-auto")}
      disabled={disabled}
      onClick={action.onClick}
      loading={sendingMessage}
    >
      <Typography
        tag="span"
        className="text-natural-700 text-caption font-semibold"
      >
        {action.label}
      </Typography>
    </Button>
  );

  return (
    <div
      className={cn(
        "flex flex-col items-stretch gap-4 p-4 md:p-6 bg-natural-50",
        "border rounded-2xl border-natural-100"
      )}
    >
      <div className="flex justify-between items-stretch gap-6">
        {!canceled && dayjs().isAfter(end) ? (
          <div className="flex gap-2 items-center">
            <CheckCircle className="[&>*]:stroke-brand-700 w-6 h-6" />
            <Typography
              tag="span"
              className={cn(
                "text-brand-700 line-clamp-1 truncate text-caption font-semibold"
              )}
            >
              {intl("lessons.end")}
            </Typography>
          </div>
        ) : (
          <>
            <Typography
              tag="h1"
              className={cn(
                "line-clamp-1 text-caption font-semibold",
                !canceled ? "text-brand-700" : "text-destructive-600"
              )}
            >
              {title}
            </Typography>
            {!canceled ? (
              <Menu actions={actions}>
                <More className="[&>*]:fill-natural-800 w-4 h-1" />
              </Menu>
            ) : null}
          </>
        )}
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex gap-2">
          <div className="relative min-w-[74px] min-h-[74px] aspect-square shrink-0">
            <div
              className={cn(
                "absolute w-[19px] h-[19px] right-0 top-0  p-0.5 bg-success-700 rounded-full z-10",
                "flex items-center justify-center"
              )}
            >
              <Typography tag="span" className="text-natural-0 text-[10px]">
                {member.level}
              </Typography>
            </div>
            <div className="w-full h-full rounded-full overflow-hidden">
              <AvatarV2 src={member.image} alt={member.name} id={member.id} />
            </div>
          </div>
          <div className="flex w-full flex-col gap-1">
            <Typography
              tag="span"
              className="text-caption font-bold leading-[21px] text-natural-950"
            >
              {member.name}
            </Typography>

            <div className="flex justify-between">
              <div className="flex">
                <Clock className="w-3.5 h-3.5 gap-1 " />
                <Typography
                  tag="span"
                  className="text-natural-700 flex items-center text-tiny font-normal"
                >
                  z{dayjs(start).format("h:mm a")}
                  {" - "}
                  {dayjs(start).add(duration, "minutes").format("h:mm a")}
                </Typography>
              </div>

              <div className="flex">
                <Calendar className="w-3.5 h-3.5" />
                <Typography
                  tag="span"
                  className="text-natural-700 text-tiny font-normal"
                >
                  {dayjs(start).format("dddd، D MMMM")}
                </Typography>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-1">
              {member.topics.map((topic, index) => {
                if (index < 4)
                  return (
                    <Typography
                      key={topic}
                      tag="span"
                      className="border border-natural-500 rounded-[200px] px-1.5 py-1"
                    >
                      {topic}
                    </Typography>
                  );
                if (index === 4)
                  return (
                    <Typography
                      key={index}
                      tag="span"
                      className="border border-natural-500 rounded-[200px] px-1.5 py-1"
                    >
                      {member.topics.length - 4}+
                    </Typography>
                  );
              })}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          {button}
          <Button
            startIcon={<AllMessages className="icon w-4 h-4" />}
            type="natural"
            size="large"
          />
        </div>
      </div>
    </div>
  );
};

export default LessonCard;
