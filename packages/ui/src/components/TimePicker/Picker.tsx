import React, { useMemo } from "react";
import { range } from "lodash";
import cn from "classnames";
import { Button } from "@/components/Button";
import { Meridiem, Time } from "@litespace/utils/time";

const Picker: React.FC<{
  labels: { am: string; pm: string };
  time?: Time;
  onChange?: (time: Time) => void;
}> = ({ labels, time, onChange }) => {
  const midday = useMemo(() => time?.asMiddayParts(), [time]);

  const hours = useMemo(() => {
    return range(1, 13).map((hours) => ({
      label: hours,
      active: hours === midday?.hours,
      onClick: () => {
        if (!onChange) return;
        const updated = time
          ? time.setHours(hours, false)
          : Time.from({
              hours,
              minutes: 0,
              meridiem: Meridiem.PM,
            });

        onChange(updated);
      },
    }));
  }, [midday?.hours, onChange, time]);

  const minutes = useMemo(() => {
    return [0, 15, 30, 45].map((minutes) => ({
      label: minutes.toString().padStart(2, "0"),
      active: minutes === midday?.minutes,
      onClick: () => {
        if (!onChange) return;
        const updated = time
          ? time.setMintues(minutes)
          : Time.from({ hours: 1, minutes, meridiem: Meridiem.PM });

        onChange(updated);
      },
    }));
  }, [midday?.minutes, onChange, time]);

  const meridiems = useMemo(() => {
    const options: Array<{ label: string; value: Meridiem }> = [
      { label: labels.am, value: Meridiem.AM },
      { label: labels.pm, value: Meridiem.PM },
    ];
    return options.map(({ label, value }) => ({
      label,
      active: value === midday?.meridiem,
      onClick: () => {
        if (!onChange) return;
        const updated = time
          ? time.setMeridiem(value)
          : Time.from({ hours: 1, minutes: 0, meridiem: value });

        onChange(updated);
      },
    }));
  }, [labels.am, labels.pm, midday?.meridiem, onChange, time]);

  const cols = useMemo(() => {
    return [hours, minutes, meridiems];
  }, [hours, meridiems, minutes]);

  return (
    <div className="pb-2">
      <div
        className={cn(
          "max-h-[250px] overflow-y-auto overflow-x-hidden",
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
                  size={"small"}
                  onClick={onClick}
                  type={"main"}
                  variant={active ? "primary" : "secondary"}
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
