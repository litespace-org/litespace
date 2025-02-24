import { Avatar } from "@/components/Avatar";
import { Typography } from "@/components/Typography";
import { orUndefined } from "@litespace/utils/utils";
import React from "react";
import Calendar from "@litespace/assets/Calendar";
import Clock from "@litespace/assets/Clock";
import Timer from "@litespace/assets/Timer";
import dayjs from "@/lib/dayjs";
import { formatMinutes } from "@/components/utils";
import { Button } from "@/components/Button";
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
  confirmationLoading?: boolean;
}> = ({
  tutorId,
  name,
  imageUrl,
  start,
  duration,
  onConfrim,
  onEdit,
  confirmationLoading,
}) => {
  const intl = useFormatMessage();
  return (
    <div className="tw-flex tw-flex-col tw-gap-6">
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
            tag="span"
            className="tw-text-natural-950 tw-text-subtitle-1 tw-font-bold"
          >
            {name}
          </Typography>

          <div className="tw-flex tw-flex-col tw-gap-2">
            <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
              <Calendar className="tw-h-6 tw-w-6" />
              <Typography
                tag="span"
                className="tw-text-natural-950 tw-text-subtitle-1 tw-font-semibold"
              >
                {dayjs(start).format("dddd, D MMMM")}
              </Typography>
            </div>

            <div className="tw-flex tw-flex-row tw-gap-[88px]">
              <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                <Clock className="tw-w-6 tw-h-6" />

                <Typography
                  tag="span"
                  className="tw-text-natural-950 tw-font-semibold tw-text-subtitle-2"
                >
                  {dayjs(start).format("h:mm a")}
                </Typography>
              </div>
              <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                <Timer className="tw-w-6 tw-h-6" />

                <Typography
                  tag="span"
                  className="tw-text-natural-950 tw-font-semibold tw-text-subtitle-2"
                >
                  {formatMinutes(duration)}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tw-flex tw-flex-row tw-gap-6 tw-pb-5">
        <Button
          className="tw-w-full"
          loading={confirmationLoading}
          disabled={confirmationLoading}
          onClick={onConfrim}
          size="large"
        >
          {intl("book-lesson.confirm")}
        </Button>
        <Button
          className="tw-w-full"
          disabled={confirmationLoading}
          variant="secondary"
          onClick={onEdit}
          size="large"
        >
          {intl("book-lesson.edit")}
        </Button>
      </div>
    </div>
  );
};
