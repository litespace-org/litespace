import { Avatar } from "@/components/Avatar";
import { Typography } from "@/components/Typography";
import { orUndefined } from "@litespace/sol/utils";
import React from "react";
import Calendar from "@litespace/assets/Calendar";
import Clock from "@litespace/assets/Clock";
import Timer from "@litespace/assets/Timer";
import dayjs from "@/lib/dayjs";
import { formatMinutes } from "@/components/utils";
import { Button, ButtonVariant } from "@/components/Button";
import { useFormatMessage } from "@/hooks";
import { Void } from "@litespace/types";

export const Confirmation: React.FC<{
  tutorId: number;
  name: string | null;
  imageUrl: string | null;
  start: string;
  duration: number;
  onConfrim: Void;
  onEdit: Void;
}> = ({ tutorId, name, imageUrl, start, duration, onConfrim, onEdit }) => {
  const intl = useFormatMessage();
  return (
    <div className="tw-flex tw-flex-col tw-gap-14">
      <div className="tw-flex tw-flex-row tw-gap-6">
        <div className="tw-w-[120px] tw-h-[120px] tw-overflow-hidden tw-rounded-full">
          <Avatar
            src={orUndefined(imageUrl)}
            alt={orUndefined(name)}
            seed={tutorId.toString()}
          />
        </div>
        <div className="tw-flex tw-flex-col tw-gap-4">
          <Typography
            weight="bold"
            element="subtitle-1"
            className="tw-text-natural-950"
          >
            {name}
          </Typography>

          <div className="tw-flex tw-flex-col tw-gap-2">
            <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
              <Calendar />
              <Typography
                element="subtitle-2"
                weight="semibold"
                className="tw-text-natural-950"
              >
                {dayjs(start).format("dddd, D MMMM")}
              </Typography>
            </div>

            <div className="tw-flex tw-flex-row tw-gap-[88px]">
              <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                <Clock />

                <Typography
                  element="subtitle-2"
                  weight="semibold"
                  className="tw-text-natural-950"
                >
                  {dayjs(start).format("h:mm a")}
                </Typography>
              </div>
              <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                <Timer />

                <Typography
                  element="subtitle-2"
                  weight="semibold"
                  className="tw-text-natural-950"
                >
                  {formatMinutes(duration)}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tw-flex tw-flex-row tw-gap-8 tw-pb-5">
        <Button className="tw-w-full" onClick={onConfrim}>
          {intl("book-lesson.confirm")}
        </Button>
        <Button
          className="tw-w-full"
          variant={ButtonVariant.Secondary}
          onClick={onEdit}
        >
          {intl("book-lesson.edit")}
        </Button>
      </div>
    </div>
  );
};
