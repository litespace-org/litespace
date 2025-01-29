import React, { useMemo } from "react";
import { range } from "lodash";
import cn from "classnames";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import { Meridiem, Time } from "@litespace/utils/time";
import { ButtonVariant } from "@/components/Button/types";

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
    <div className="tw-pb-2">
      <div
        className={cn(
          "tw-max-h-[250px] tw-overflow-y-auto tw-overflow-x-hidden",
          "tw-scrollbar-thin tw-scrollbar-thumb-border-stronger tw-scrollbar-track-surface-300",
          "tw-flex tw-flex-row tw-pt-2 tw-pb-2 tw-h-full"
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
                  type={ButtonType.Main}
                  variant={
                    active ? ButtonVariant.Primary : ButtonVariant.Secondary
                  }
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
