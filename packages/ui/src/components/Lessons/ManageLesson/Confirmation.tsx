import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Typography } from "@/components/Typography";
import { formatMinutes } from "@/components/utils";
import { useFormatMessage } from "@/hooks";
import dayjs from "@/lib/dayjs";
import Calendar from "@litespace/assets/Calendar";
import Clock from "@litespace/assets/Clock";
import Timer from "@litespace/assets/Timer";
import { Void } from "@litespace/types";
import { orUndefined } from "@litespace/utils/utils";
import React from "react";

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
    <div className="flex flex-col gap-10 md:gap-6 mt-[34px] md:mt-6">
      <div className="flex flex-row gap-4 md:gap-6">
        <div className="w-[73px] h-[73px] md:w-[120px] md:h-[120px] overflow-hidden rounded-full">
          <Avatar
            src={orUndefined(imageUrl)}
            alt={orUndefined(name)}
            seed={tutorId.toString()}
          />
        </div>
        <div className="flex flex-col gap-2 md:gap-4">
          <Typography
            tag="span"
            className="text-natural-950 text-caption md:text-subtitle-1 font-bold"
          >
            {name}
          </Typography>

          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <Calendar className="h-4 w-4 md:h-6 md:w-6" />
              <Typography
                tag="span"
                className="text-natural-950 text-tiny md:text-subtitle-2 font-normal md:font-semibold"
              >
                {dayjs(start).format("dddd, D MMMM")}
              </Typography>
            </div>

            <div className="flex flex-row gap-[45px] md:gap-[88px]">
              <div className="flex flex-row gap-2 items-center">
                <Clock className="w-4 h-4 md:h-6 md:w-6" />

                <Typography
                  tag="span"
                  className="text-natural-950 font-normal md:font-semibold text-tiny md:text-subtitle-2"
                >
                  {dayjs(start).format("h:mm a")}
                </Typography>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <Timer className="h-4 w-4 md:h-6 md:w-6" />

                <Typography
                  tag="span"
                  className="text-natural-950 font-normal md:font-semibold text-tiny md:text-subtitle-2"
                >
                  {formatMinutes(duration)}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-3 md:gap-6">
        <Button
          className="w-full"
          loading={confirmationLoading}
          disabled={confirmationLoading}
          onClick={onConfrim}
          size="large"
        >
          <Typography tag="span" className="font-medium">
            {intl("book-lesson.confirm")}
          </Typography>
        </Button>
        <Button
          className="w-full"
          disabled={confirmationLoading}
          variant="secondary"
          onClick={onEdit}
          size="large"
        >
          <Typography tag="span" className="font-medium">
            {intl("book-lesson.edit")}
          </Typography>
        </Button>
      </div>
    </div>
  );
};
