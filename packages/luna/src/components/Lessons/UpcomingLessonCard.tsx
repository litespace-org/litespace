import { Avatar } from "@/components/Avatar";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import dayjs from "@/lib/dayjs";
import Star from "@litespace/assets/Star";
import { Void } from "@litespace/types";
import cn from "classnames";
import React from "react";

export type CardProps = {
  variant?: "default" | "canceled";
  start: string;
  duration: number;
  tutor: {
    id: number;
    name: string | null;
    image: string | undefined;
    studentCount: number;
    rating: number;
  };
  onJoin: Void;
  onCancel: Void;
};

const UpcomingLessonCard: React.FC<CardProps> = ({
  start,
  duration,
  tutor,
  variant = "default",
  onJoin,
  onCancel,
}) => {
  const intl = useFormatMessage();
  return (
    <div
      className={cn(
        "tw-flex tw-flex-col tw-gap-6 tw-w-[255px] tw-py-6",
        "tw-border tw-rounded-2xl tw-border-natural-200 tw-shadow-lesson-upcoming-card",
        "hover:tw-bg-brand-50",
        { "tw-bg-natural-50": variant === "default" },
        { "tw-bg-destructive-50": variant === "canceled" }
      )}
    >
      <div className="tw-flex tw-justify-center tw-border-b tw-border-natural-200 tw-pb-4">
        {variant === "canceled" ? (
          <Typography
            element="caption"
            weight="semibold"
            className="tw-text-[14px] tw-leading-[21px] tw-text-destructive-600"
          >
            {intl("lessons.cancel.message")}
          </Typography>
        ) : (
          <div className="tw-flex tw-justify-center tw-gap-4">
            <Typography
              element="caption"
              weight="semibold"
              className="tw-text-brand-700 tw-leading-[21px]"
            >
              {dayjs(start).format("h:mm a")}
              {" - "}
              {dayjs(start).add(duration, "minutes").format("h:mm a")}
            </Typography>
            <Typography
              element="caption"
              weight="semibold"
              className="tw-text-natural-950 tw-leading-[21px]"
            >
              {dayjs(start).format("dddd, D MMMM")}
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
              className="tw-text-xs tw-leading-[18px] tw-text-natural-700"
            >
              {intl("labels.students")}: {tutor.studentCount}
            </Typography>
            <Typography
              element="tiny-text"
              weight="regular"
              className="tw-text-xs tw-leading-[18px] tw-text-natural-700 tw-flex tw-items-center"
            >
              {intl("labels.rating")}: {tutor.rating}
              <Star className="tw-inline-block tw-ms-1" />
            </Typography>
          </div>
        </div>
        <div className="tw-flex tw-gap-4">
          {variant === "canceled" ? (
            <Button
              size={ButtonSize.Tiny}
              className="tw-w-full tw-text-[14px] tw-leading-[21px] tw-font-semibold disabled:tw-opacity-50"
              onClick={onJoin}
            >
              {intl("lessons.reregister")}
            </Button>
          ) : (
            <>
              <Button
                size={ButtonSize.Tiny}
                className="tw-text-[14px] tw-leading-[21px] tw-font-semibold disabled:tw-opacity-50"
                onClick={onJoin}
              >
                {intl("lessons.join.now")}
              </Button>
              <Button
                size={ButtonSize.Tiny}
                type={ButtonType.Error}
                className="tw-text-[14px] tw-leading-[21px] tw-font-semibold disabled:tw-opacity-50"
                onClick={onCancel}
              >
                {intl("lessons.cancel.registration")}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingLessonCard;
