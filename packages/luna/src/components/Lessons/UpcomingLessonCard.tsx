import { Avatar } from "@/components/Avatar";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import dayjs from "@/lib/dayjs";
import Star from "@litespace/assets/Star";
import { Void } from "@litespace/types";
import cn from "classnames";
import React, { useMemo } from "react";

export type CardProps = {
  start: string;
  duration: number;
  canceled: boolean;
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

  const canJoin = useMemo(() => {
    const end = dayjs(start).add(duration, "minutes");
    return dayjs().isBetween(
      dayjs(start).subtract(10, "minutes"),
      end,
      "minutes",
      "[]"
    );
  }, [duration, start]);

  return (
    <div
      className={cn(
        "tw-flex tw-flex-col tw-gap-6 tw-py-6",
        "tw-border tw-rounded-2xl tw-border-natural-200 tw-shadow-lesson-upcoming-card",
        {
          "tw-bg-brand-100": canJoin,
          "tw-bg-destructive-50": canceled,
          "tw-bg-natural-50": !canceled && !canJoin,
        }
      )}
    >
      <div className="tw-flex tw-justify-center tw-border-b tw-border-natural-200 tw-pb-4 tw-px-2">
        {canceled ? (
          <Typography
            element="caption"
            weight="semibold"
            className="tw-text-[14px] tw-leading-[21px] tw-text-destructive-600"
          >
            {intl("lessons.canceled-by-tutor")}
          </Typography>
        ) : (
          <div className="tw-flex tw-justify-center tw-gap-4">
            <Typography
              element="caption"
              weight="semibold"
              className="tw-text-brand-700"
            >
              {dayjs(start).format("h:mm a")}
              {" - "}
              {dayjs(start).add(duration, "minutes").format("h:mm a")}
            </Typography>
            <Typography
              element="caption"
              weight="semibold"
              className="tw-text-natural-950"
            >
              {dayjs(start).format("dddd، D MMMM")}
            </Typography>
          </div>
        )}
      </div>
      <div className="tw-flex tw-flex-col tw-gap-6 tw-px-6">
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
              {intl("lessons.tutor.student-count", {
                value: tutor.studentCount,
              })}
            </Typography>
            <Typography
              element="tiny-text"
              weight="regular"
              className="tw-text-natural-700 tw-flex tw-items-center"
            >
              {intl("lessons.tutor.rating", { value: tutor.rating })}
              <Star className="tw-inline-block tw-ms-1" />
            </Typography>
          </div>
        </div>
        <div className="tw-flex tw-gap-4 tw-justify-center">
          {canceled ? (
            <Button
              size={ButtonSize.Tiny}
              className="tw-w-full tw-text-[14px] tw-leading-[21px] tw-font-semibold disabled:tw-opacity-50"
              onClick={onRebook}
            >
              {intl("lessons.rebook")}
            </Button>
          ) : (
            <>
              <Button
                size={ButtonSize.Tiny}
                className="tw-text-[14px] tw-leading-[21px] tw-font-semibold disabled:tw-opacity-50"
                onClick={onJoin}
                disabled={!canJoin}
              >
                {intl("lessons.join.now")}
              </Button>
              <Button
                size={ButtonSize.Tiny}
                type={ButtonType.Error}
                className="tw-text-[14px] tw-leading-[21px] tw-font-semibold disabled:tw-opacity-50"
                onClick={onCancel}
                disabled={canJoin}
              >
                {intl("lessons.cancel")}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingLessonCard;