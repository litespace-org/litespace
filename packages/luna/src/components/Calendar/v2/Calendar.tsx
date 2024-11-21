import React from "react";
import { Dayjs } from "dayjs";
import { Hours } from "@/components/Calendar/v2/Hours";
import { WeekHours } from "@/components/Calendar/v2/WeekHours";
import Header from "@/components/Calendar/v2/Header";
import { HourView } from "@/components/Calendar/v2/types";
import cn from "classnames";
import { Void } from "@litespace/types";

interface Props {
  date: Dayjs;
  nextWeek: Void;
  prevWeek: Void;
  HourView?: HourView;
}

export const Calendar: React.FC<Props> = ({
  date,
  nextWeek,
  prevWeek,
  HourView,
}) => {
  return (
    <div className="tw-w-full">
      <div className="tw-mb-8 tw-w-full">
        <Header date={date} nextWeek={nextWeek} prevWeek={prevWeek} />
      </div>
      <div
        className={cn(
          "tw-w-full tw-flex tw-bg-natural-100 tw-border tw-border-natural-300/50",
          "tw-shadow-calendar tw-rounded-2xl tw-overflow-hidden"
        )}
      >
        <Hours day={date} />
        <div className="tw-grid tw-grid-cols-7 tw-w-full">
          <WeekHours day={date} HourView={HourView} />
        </div>
      </div>
    </div>
  );
};
