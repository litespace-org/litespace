import React from "react";
import { Dayjs } from "dayjs";
import { Hours } from "@/components/Calendar/v2/Hours";
import { WeekHours } from "@/components/Calendar/v2/WeekHours";
import { HourView } from "@/components/Calendar/v2/types";
import cn from "classnames";

interface Props {
  date: Dayjs;
  HourView?: HourView;
}

export const Calendar: React.FC<Props> = ({ date, HourView }) => {
  return (
    <div className="tw-w-full">
      <div
        className={cn(
          "tw-w-full tw-flex tw-bg-natural-50 tw-border tw-border-natural-300",
          "tw-shadow-calendar tw-rounded-2xl"
        )}
      >
        <Hours day={date} />
        <div className="tw-grid tw-grid-cols-7 tw-w-full tw-rounded-tl-3xl">
          <WeekHours day={date} HourView={HourView} />
        </div>
      </div>
    </div>
  );
};
