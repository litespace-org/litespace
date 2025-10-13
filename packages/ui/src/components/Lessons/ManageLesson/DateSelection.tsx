import { Button } from "@/components/Button";
import { Typography } from "@/components/Typography";
import ChevronLeft from "@litespace/assets/ChevronLeft";
import ChevronRight from "@litespace/assets/ChevronRight";
import { Void } from "@litespace/types";
import cn from "classnames";
import dayjs, { Dayjs } from "dayjs";
import { range } from "lodash";
import React, { useCallback, useMemo } from "react";

const rows = 7;

type DayGrid = Dayjs[];

function getWeekDays(date: Dayjs): DayGrid {
  return range(0, rows).map((day) => {
    return date.add(day, "day");
  });
}

export const DateSelection: React.FC<{
  onSelect: (date: Dayjs) => void;
  isSelectable: (date: Dayjs) => boolean;
  min: Dayjs;
  max: Dayjs;
  prev: Void;
  next: Void;
  selected: Dayjs | null;
  disable?: boolean;
}> = ({ onSelect, isSelectable, selected, min, max, prev, next, disable }) => {
  const weekDays = useMemo(() => getWeekDays(min), [min]);

  const isOutOfRange = useCallback(
    (date: Dayjs) => date.isBefore(min, "day") || date.isAfter(max, "day"),
    [max, min]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4 items-center justify-between">
        <Button
          type="natural"
          variant="secondary"
          onClick={prev}
          htmlType="button"
          startIcon={<ChevronRight className="icon [&>*]:stroke-natural-700" />}
        />
        <Typography
          tag="span"
          className="text-natural-950 text-caption font-medium"
        >
          {min.format("DD MMMM")}
          {" - "}
          {max.subtract(1, "day").format("DD MMMM")}
        </Typography>
        <Button
          type="natural"
          variant="secondary"
          onClick={next}
          htmlType="button"
          startIcon={<ChevronLeft className="icon [&>*]:stroke-natural-700" />}
        />
      </div>
      <ul
        className={cn(
          "grid grid-cols-7 gap-2 w-full px-4 sm:px-0 justify-between"
        )}
      >
        {weekDays.map((day) => {
          const isSelected = !!selected?.isSame(day, "day");
          return (
            <Button
              key={day.format()}
              htmlType="button"
              type={isSelected ? "main" : "natural"}
              variant="secondary"
              onClick={() => onSelect(day)}
              disabled={
                disable ||
                dayjs().startOf("day").isAfter(day) ||
                isOutOfRange(day) ||
                !isSelectable(day)
              }
              size="custom"
              className="!border-none w-full"
            >
              <div className="p-1 flex flex-col items-center gap-[6px]">
                <Typography tag="p" className="text-extra-tiny font-medium">
                  {day.format("dddd")}
                </Typography>

                <Typography
                  tag="p"
                  className={cn(
                    "h-6 w-6 text-caption font-medium",
                    isSelected
                      ? "border border-brand-500 rounded-[4px] text-brand-500"
                      : "text-natural-950"
                  )}
                >
                  {day.format("D")}
                </Typography>
              </div>
            </Button>
          );
        })}
      </ul>
    </div>
  );
};
