import { Avatar } from "@/components/Avatar";
import { Typography } from "@/components/Typography";
import { orUndefined } from "@litespace/utils/utils";
import React from "react";
import Calendar from "@litespace/assets/Calendar";
import Clock from "@litespace/assets/Clock";
import Timer from "@litespace/assets/Timer";
import dayjs from "@/lib/dayjs";
import { formatMinutes } from "@/components/utils";
import { Button, ButtonSize, ButtonVariant } from "@/components/Button";
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
  isLargeScreen: boolean;
}> = ({
  tutorId,
  name,
  imageUrl,
  start,
  duration,
  onConfrim,
  onEdit,
  confirmationLoading,
  isLargeScreen,
}) => {
  const intl = useFormatMessage();
  return (
    <div className="tw-flex tw-flex-col tw-gap-10 lg:tw-gap-6 tw-mt-[34px] lg:tw-mt-6">
      <div className="tw-flex tw-flex-row tw-gap-4 lg:tw-gap-6">
        <div className="tw-w-[73px] tw-h-[73px] lg:tw-w-[120px] lg:tw-h-[120px] tw-overflow-hidden tw-rounded-full">
          <Avatar
            src={orUndefined(imageUrl)}
            alt={orUndefined(name)}
            seed={tutorId.toString()}
          />
        </div>
        <div className="tw-flex tw-flex-col tw-gap-2 lg:tw-gap-4">
          <Typography
            weight="bold"
            element={{ default: "caption", lg: "subtitle-1" }}
            className="tw-text-natural-950"
          >
            {name}
          </Typography>

          <div className="tw-flex tw-flex-col tw-gap-2">
            <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
              <Calendar className="tw-h-4 tw-w-4 lg:tw-h-6 lg:tw-w-6" />
              <Typography
                element={{ default: "tiny-text", lg: "subtitle-2" }}
                weight={{ default: "regular", lg: "semibold" }}
                className="tw-text-natural-950"
              >
                {dayjs(start).format("dddd, D MMMM")}
              </Typography>
            </div>

            <div className="tw-flex tw-flex-row tw-gap-[45px] lg:tw-gap-[88px]">
              <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                <Clock className="tw-h-4 tw-w-4 lg:tw-h-6 lg:tw-w-6" />
                <Typography
                  element={{ default: "tiny-text", lg: "subtitle-2" }}
                  weight={{ default: "regular", lg: "semibold" }}
                  className="tw-text-natural-950"
                >
                  {dayjs(start).format("h:mm a")}
                </Typography>
              </div>
              <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
                <Timer className="tw-h-4 tw-w-4 lg:tw-h-6 lg:tw-w-6" />
                <Typography
                  element={{ default: "tiny-text", lg: "subtitle-2" }}
                  weight={{ default: "regular", lg: "semibold" }}
                  className="tw-text-natural-950"
                >
                  {formatMinutes(duration)}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tw-flex tw-flex-row tw-gap-4 lg:tw-gap-6">
        <Button
          size={isLargeScreen ? ButtonSize.Small : ButtonSize.Tiny}
          className="tw-w-full"
          loading={confirmationLoading}
          disabled={confirmationLoading}
          onClick={onConfrim}
        >
          {intl("book-lesson.confirm")}
        </Button>
        <Button
          size={isLargeScreen ? ButtonSize.Small : ButtonSize.Tiny}
          className="tw-w-full"
          disabled={confirmationLoading}
          variant={ButtonVariant.Secondary}
          onClick={onEdit}
        >
          {intl("book-lesson.edit")}
        </Button>
      </div>
    </div>
  );
};
