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
import { Tooltip } from "@/components/Tooltip";

export type Props = {
  start: string;
  duration: number;
  canceled: "tutor" | "student" | null;
  tutor: {
    id: number;
    name: string | null;
    image: string | undefined;
  };
  onRebook: Void;
  onJoin: Void;
  onCancel: Void;
};

export const LessonCard: React.FC<Props> = ({
  start,
  duration,
  tutor,
  canceled,
  onJoin,
  onCancel,
  onRebook,
}) => {
  const intl = useFormatMessage();
  const end = dayjs(start).add(duration, "minutes");
  const [title, setTitle] = useState<string | undefined>(() => {
    const now = dayjs();
    // canceled by tutor
    if (canceled === "tutor") return intl("lessons.canceled-by-tutor");

    // canceled by tutor
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
    return dayjs().isAfter(end) || canceled;
  }, [canceled, end]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs();
      // canceled
      if (canceled) setTitle(intl("lessons.canceled-by-tutor"));

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
  }, [start, end, canceled, title, intl, duration]);

  const actions: MenuAction[] = useMemo(
    () => [
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
    ],
    [intl, onCancel]
  );

  const button = (
    <Button
      size={ButtonSize.Tiny}
      className={cn(
        "tw-w-full tw-text-[14px] tw-leading-[21px] tw-font-semibold tw-mt-auto"
      )}
      disabled={!canJoin && !canRebook}
      onClick={canceled ? onRebook : onJoin}
    >
      {canceled || dayjs().isAfter(end)
        ? intl("lessons.button.rebook")
        : intl("lessons.button.join")}
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
                <More />
              </Menu>
            ) : null}
          </>
        )}
      </div>
      <div className="tw-flex tw-flex-col tw-gap-6">
        <div className="tw-flex tw-gap-2">
          <div className="tw-w-[65px] tw-h-[65px] tw-rounded-full tw-overflow-hidden">
            <Avatar
              src={tutor.image}
              seed={tutor.id.toString()}
              alt={tutor.image}
            />
          </div>
          <div className="tw-flex tw-flex-col tw-gap-1">
            <Typography
              element="caption"
              weight="bold"
              className="tw-text-[14px] tw-leading-[21px] tw-text-natural-950"
            >
              {tutor.name}
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
        {!canJoin ? (
          <Tooltip
            content={
              <Typography className="tw-w-full tw-max-w-44">
                {intl("lessons.join-lesson-note")}
              </Typography>
            }
          >
            <div>{button}</div>
          </Tooltip>
        ) : (
          button
        )}
      </div>
    </div>
  );
};

export default LessonCard;
