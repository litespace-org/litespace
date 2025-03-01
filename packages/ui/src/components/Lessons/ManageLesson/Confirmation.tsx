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
    <div className="flex flex-col gap-6">
      <div className="flex flex-row gap-6">
        <div className="w-[120px] h-[120px] overflow-hidden rounded-full">
          <Avatar
            src={orUndefined(imageUrl)}
            alt={orUndefined(name)}
            seed={tutorId.toString()}
          />
        </div>
        <div className="flex flex-col gap-4">
          <Typography
            tag="span"
            className="text-natural-950 text-subtitle-1 font-bold"
          >
            {name}
          </Typography>

          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <Calendar className="h-6 w-6" />
              <Typography
                tag="span"
                className="text-natural-950 text-subtitle-1 font-semibold"
              >
                {dayjs(start).format("dddd, D MMMM")}
              </Typography>
            </div>

            <div className="flex flex-row gap-[88px]">
              <div className="flex flex-row gap-2 items-center">
                <Clock className="w-6 h-6" />

                <Typography
                  tag="span"
                  className="text-natural-950 font-semibold text-subtitle-2"
                >
                  {dayjs(start).format("h:mm a")}
                </Typography>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <Timer className="w-6 h-6" />

                <Typography
                  tag="span"
                  className="text-natural-950 font-semibold text-subtitle-2"
                >
                  {formatMinutes(duration)}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-6 pb-5">
        <Button
          className="w-full"
          loading={confirmationLoading}
          disabled={confirmationLoading}
          onClick={onConfrim}
          size="large"
        >
          {intl("book-lesson.confirm")}
        </Button>
        <Button
          className="w-full"
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
