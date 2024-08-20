import React, { useMemo } from "react";
import { range } from "lodash";
import cn from "classnames";
import { Button, ButtonSize, ButtonType } from "../Button";

export type Meridiem = "am" | "pm";

const Picker: React.FC<{
  labels: { am: string; pm: string };
  meridiem?: Meridiem;
  hour?: number;
  mintue?: number;
  onMeridiemChange?: (meridiem: Meridiem) => void;
  onHourChange?: (hour: number) => void;
  onMintueChange?: (minutes: number) => void;
}> = ({
  labels,
  meridiem,
  hour,
  mintue,
  onMeridiemChange,
  onHourChange,
  onMintueChange,
}) => {
  const hours = useMemo(() => {
    return range(1, 13).map((dayHour) => ({
      label: dayHour,
      active: dayHour === hour,
      onClick: () => onHourChange && onHourChange(dayHour),
    }));
  }, [hour, onHourChange]);

  const minutes = useMemo(() => {
    return [0, 15, 30, 45].map((option) => ({
      label: option.toString().padStart(2, "0"),
      active: option === mintue,
      onClick: () => onMintueChange && onMintueChange(option),
    }));
  }, [mintue, onMintueChange]);

  const meridiems = useMemo(() => {
    const options: Array<{ label: string; value: Meridiem }> = [
      { label: labels.am, value: "am" },
      { label: labels.pm, value: "pm" },
    ];
    return options.map(({ label, value }) => ({
      label,
      active: meridiem === value,
      onClick: () => onMeridiemChange && onMeridiemChange(value),
    }));
  }, [labels.am, labels.pm, meridiem, onMeridiemChange]);

  const cols = useMemo(
    () => [hours, minutes, meridiems],
    [hours, meridiems, minutes]
  );

  return (
    <div className="pb-2">
      <div
        className={cn(
          "max-h-[250px] overflow-y-auto",
          "scrollbar-thin scrollbar-thumb-border-stronger scrollbar-track-surface-300",
          "flex flex-row pt-2 pb-2 h-full"
        )}
      >
        {cols.map((col, idx) => {
          return (
            <ul
              key={idx}
              className={cn(
                "flex flex-col px-2 gap-2 h-[400px]",
                idx <= 1 && "border-l border-border"
              )}
            >
              {col.map(({ label, active, onClick }) => (
                <Button
                  key={label}
                  htmlType="button"
                  size={ButtonSize.Tiny}
                  onClick={onClick}
                  type={active ? ButtonType.Primary : ButtonType.Secondary}
                >
                  {label}
                </Button>
              ))}
            </ul>
          );
        })}
      </div>
    </div>
  );
};

export default Picker;
