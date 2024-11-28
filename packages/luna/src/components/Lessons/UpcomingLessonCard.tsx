import { Avatar } from "@/components/Avatar";
import Frame from "@litespace/assets/Frame";
import { Button, ButtonSize } from "@/components/Button";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import dayjs from "@/lib/dayjs";
import { Void } from "@litespace/types";
import cn from "classnames";
import React, { useEffect, useMemo, useState } from "react";

export type CardProps = {
  start: string;
  duration: number;
  canceled: "tutor" | "student" | null;
  tutor: {
    id: number;
    name: string | null;
    image: string | undefined;
    studentCount: number;
    rating: number;
  };
  onRebook: Void;
  onJoin: Void;
  onCancel: Void;
};

export const UpcomingLessonCard: React.FC<CardProps> = ({
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
    if (canceled) return intl("lessons.canceled-by-tutor");

    if (!canceled && now.isBefore(start, "second"))
      return intl("lessons.time-to-join", {
        value: dayjs(end).fromNow(true),
        finish: intl("labels.end"),
      });

    if (!canceled && now.isBetween(start, end, "seconds", "[]"))
      return intl("lessons.time-to-join", {
        value: dayjs(end).fromNow(true),
        finish: intl("labels.end"),
      });
  });

  const canJoin = useMemo(() => {
    return dayjs().isBetween(
      dayjs(start).subtract(10, "minutes"),
      end,
      "minutes",
      "[]"
    );
  }, [end, start]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs();
      if (canceled) setTitle(intl("lessons.canceled-by-tutor"));

      if (!canceled && now.isBefore(start, "second"))
        setTitle(
          intl("lessons.time-to-join", {
            value: dayjs(end).fromNow(true),
            finish: intl("labels.end"),
          })
        );

      if (!canceled && now.isBetween(start, end, "seconds", "[]"))
        setTitle(
          intl("lessons.time-to-join", {
            value: dayjs(end).fromNow(true),
            finish: intl("labels.end"),
          })
        );
    }, 60_000);
    return () => clearInterval(interval);
  }, [start, end, canceled, title, intl]);

  return (
    <div
      className={cn(
        "tw-flex tw-flex-col tw-items-stretch tw-gap-4 tw-p-6 tw-bg-natural-50",
        "tw-border tw-rounded-2xl tw-border-natural-200 tw-shadow-lesson-upcoming-card"
      )}
    >
      <div className="tw-flex tw-justify-between tw-items-center tw-gap-6">
        <Typography
          element="caption"
          weight="semibold"
          className={cn(
            "tw-text-[14px]",
            dayjs().isBefore(end) && !canceled
              ? "tw-text-brand-700"
              : "tw-text-destructive-600"
          )}
        >
          {title}
        </Typography>
        <Frame onClick={onCancel} className="hover:tw-cursor-pointer" />
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
        <Button
          size={ButtonSize.Tiny}
          className={cn(
            "tw-w-full tw-text-[14px] tw-leading-[21px] tw-font-semibold tw-mt-auto",
            { "tw-opacity-50": !canJoin }
          )}
          disabled={!canJoin}
          onClick={canceled ? onRebook : onJoin}
        >
          {canceled ? intl("lessons.rebook") : intl("lessons.join")}
        </Button>
      </div>
    </div>
  );
};

export default UpcomingLessonCard;
