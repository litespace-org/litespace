import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { IDate } from "@litespace/types";
import { Checkbox } from "@/components/Checkbox";
import cn from "classnames";
import { Button, ButtonSize, ButtonType } from "../Button";
import {
  BorderDottedIcon,
  CaretDownIcon,
  Cross1Icon,
} from "@radix-ui/react-icons";
import { clone, concat, orderBy } from "lodash";
import { asArabicDayIndex } from "@/lib/time";

export type WeekdayMap = {
  saturday: string;
  sunday: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  all: string;
  reset: string;
};

const DISPLAY_DAY_COUNT = 2;

export const WeekdayPicker: React.FC<{
  placeholder?: string;
  weekdayMap: WeekdayMap;
  weekdays?: IDate.Weekday[];
  onChange?: (weekdays: IDate.Weekday[]) => void;
}> = ({ weekdayMap, placeholder, weekdays = [], onChange }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(false);

  const show = useCallback(() => setOpen(true), []);
  const toggle = useCallback(() => setOpen(!open), [open]);
  const hide = useCallback((e: MouseEvent) => {
    if (!wrapperRef.current) return;

    if (
      e.target instanceof HTMLElement &&
      e.target !== wrapperRef.current &&
      !wrapperRef.current.contains(e.target)
    )
      setOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener("click", hide);
    return () => document.removeEventListener("click", hide);
  }, [hide]);

  const options = useMemo(() => {
    return [
      { label: weekdayMap.saturday, value: IDate.Weekday.Saturday },
      { label: weekdayMap.sunday, value: IDate.Weekday.Sunday },
      { label: weekdayMap.monday, value: IDate.Weekday.Monday },
      { label: weekdayMap.tuesday, value: IDate.Weekday.Tuesday },
      { label: weekdayMap.wednesday, value: IDate.Weekday.Wednesday },
      { label: weekdayMap.thursday, value: IDate.Weekday.Thursday },
      { label: weekdayMap.friday, value: IDate.Weekday.Friday },
    ];
  }, [
    weekdayMap.friday,
    weekdayMap.monday,
    weekdayMap.saturday,
    weekdayMap.sunday,
    weekdayMap.thursday,
    weekdayMap.tuesday,
    weekdayMap.wednesday,
  ]);

  const onCheckedChange = useCallback(
    (weekday: IDate.Weekday, checked: boolean) => {
      if (!onChange) return;
      const list = clone(weekdays);
      const updated = checked
        ? concat(list, weekday)
        : list.filter((day) => day !== weekday);
      onChange(updated);
    },
    [onChange, weekdays]
  );

  const selectAll = useCallback(() => {
    if (!onChange) return;
    onChange(options.map((option) => option.value));
    setOpen(false);
  }, [onChange, options]);

  const reset = useCallback(() => {
    if (!onChange) return;
    onChange([]);
    setOpen(false);
  }, [onChange]);

  const no = useMemo(() => weekdays.length === 0, [weekdays.length]);
  const many = useMemo(
    () => weekdays.length > DISPLAY_DAY_COUNT,
    [weekdays.length]
  );
  const display = useMemo(
    () =>
      orderBy(weekdays, (value) => asArabicDayIndex(value), "asc").slice(0, 2),
    [weekdays]
  );

  return (
    <div className="w-full relative" ref={wrapperRef}>
      <div
        tabIndex={0}
        className={cn(
          "w-full outline-none text-foreground focus:ring-background-control focus:ring-2 focus-visible:border-foreground-muted focus-visible:ring-background-control",
          "border border-control text-sm px-4 py-2 bg-foreground/[0.026] rounded-md h-[38px]",
          "flex justify-between items-center cursor-pointer"
        )}
        onFocus={show}
        onMouseDown={toggle}
      >
        <ul className="flex flex-wrap max-w-[80%] items-center gap-3">
          {display.map((weekday) => {
            const label = options.find((option) => option.value === weekday);
            return (
              <button
                type="button"
                role="button"
                key={weekday}
                className="bg-background-selection px-2 rounded-lg flex items-center justify-center gap-1 h-[20px] text-sm"
              >
                <Cross1Icon
                  className="w-[15px] h-[15px] px-1 cursor-pointer bg-muted rounded-full"
                  onClick={() => onCheckedChange(weekday, false)}
                />
                {label?.label}
              </button>
            );
          })}

          {many ? (
            <li className="bg-background-selection px-2 rounded-lg flex items-center justify-center h-[20px] text-foreground text-xs gap-1">
              {weekdays.length - DISPLAY_DAY_COUNT}
              <BorderDottedIcon />
            </li>
          ) : null}

          {no ? (
            <p className="text-foreground-muted select-none">{placeholder}</p>
          ) : null}
        </ul>
        <div
          data-open={open}
          className={cn(
            "data-[open=true]:rotate-180 transition-transform duration-300"
          )}
        >
          <CaretDownIcon />
        </div>
      </div>

      <div
        data-open={open}
        className={cn(
          "bg-background-overlay border border-control rounded-md z-[1]",
          "flex flex-col gap-2 shadow-2xl ",
          "absolute whitespace-nowrap top-[calc(100%+1px)] right-0 overflow-hidden px-1 py-2",
          "opacity-0 data-[open=true]:opacity-100 transition-all duration-300 data-[open=true]:top-[calc(100%+5px)] invisible data-[open=true]:visible"
        )}
      >
        <ul className="flex flex-col gap-2">
          {options.map((option) => (
            <li
              key={option.value}
              className="px-2 py-0.5 rounded-md hover:bg-background-overlay-hover"
            >
              <Checkbox
                label={option.label}
                checked={weekdays.includes(option.value)}
                onCheckedChange={(checked: boolean) =>
                  onCheckedChange(option.value, checked)
                }
              />
            </li>
          ))}
        </ul>

        <div className="flex px-2 mt-2 gap-2">
          <Button
            onClick={reset}
            htmlType="button"
            size={ButtonSize.Tiny}
            type={ButtonType.Secondary}
          >
            {weekdayMap.reset}
          </Button>
          <Button
            htmlType="button"
            onClick={selectAll}
            size={ButtonSize.Tiny}
            type={ButtonType.Secondary}
          >
            {weekdayMap.all}
          </Button>
        </div>
      </div>
    </div>
  );
};
