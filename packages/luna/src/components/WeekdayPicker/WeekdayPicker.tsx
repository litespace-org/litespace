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
import { ButtonVariant } from "../Button/types";

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

export type WeekdayPickerProps = {
  placeholder?: string;
  weekdayMap: WeekdayMap;
  weekdays?: IDate.Weekday[];
  onChange?: (weekdays: IDate.Weekday[]) => void;
};

const DISPLAY_DAY_COUNT = 2;

export const WeekdayPicker: React.FC<WeekdayPickerProps> = ({
  weekdayMap,
  placeholder,
  weekdays = [],
  onChange,
}) => {
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
    (weekday: IDate.Weekday) => {
      if (!onChange) return;
      const list = clone(weekdays);
      const checked = list.find((day) => day === weekday);

      const updated =
        checked !== undefined
          ? list.filter((day) => day !== weekday)
          : concat(list, weekday);
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
    <div className="tw-w-full tw-relative" ref={wrapperRef}>
      <div
        tabIndex={0}
        className={cn(
          "tw-w-full tw-outline-none tw-text-foreground focus:tw-ring-background-control focus:tw-ring-2 focus-visible:tw-border-foreground-muted focus-visible:tw-ring-background-control",
          "tw-border tw-border-control tw-text-sm tw-px-4 tw-py-2 tw-bg-foreground/[0.026] tw-rounded-md h-[38px]",
          "tw-flex tw-justify-between tw-items-center tw-cursor-pointer"
        )}
        onFocus={show}
        onMouseDown={toggle}
      >
        <ul className="tw-flex tw-flex-wrap tw-max-w-[80%] tw-items-center tw-gap-3">
          {display.map((weekday) => {
            const label = options.find((option) => option.value === weekday);
            return (
              <button
                type="button"
                role="button"
                key={weekday}
                className="tw-bg-background-selection tw-px-2 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-gap-1 tw-h-[20px] tw-text-sm"
              >
                <Cross1Icon
                  className="tw-w-[15px] tw-h-[15px] tw-px-1 tw-cursor-pointer tw-bg-muted tw-rounded-full"
                  onClick={() => onCheckedChange(weekday)}
                />
                {label?.label}
              </button>
            );
          })}

          {many ? (
            <li className="tw-bg-background-selection tw-px-2 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-h-[20px] tw-text-foreground tw-text-xs tw-gap-1">
              {weekdays.length - DISPLAY_DAY_COUNT}
              <BorderDottedIcon />
            </li>
          ) : null}

          {no ? (
            <p className="tw-text-foreground-muted tw-select-none">
              {placeholder}
            </p>
          ) : null}
        </ul>
        <div
          data-open={open}
          className={cn(
            "data-[open=true]:tw-rotate-180 tw-transition-transform tw-duration-300"
          )}
        >
          <CaretDownIcon />
        </div>
      </div>

      <div
        data-open={open}
        className={cn(
          "tw-bg-background-overlay tw-border tw-border-control tw-rounded-md tw-z-[1]",
          "tw-flex tw-flex-col tw-gap-2 tw-shadow-2xl ",
          "tw-absolute tw-whitespace-nowrap tw-top-[calc(100%+1px)] tw-right-0 tw-overflow-hidden tw-px-1 tw-py-2",
          "tw-opacity-0 data-[open=true]:tw-opacity-100 tw-transition-all tw-duration-300 data-[open=true]:tw-top-[calc(100%+5px)] tw-invisible data-[open=true]:tw-visible"
        )}
      >
        <ul className="tw-flex tw-flex-col tw-gap-2">
          {options.map((option) => (
            <li
              key={option.value}
              className="tw-px-2 tw-py-0.5 tw-rounded-md hover:tw-bg-background-overlay-hover"
            >
              <Checkbox
                label={option.label}
                checked={weekdays.includes(option.value)}
                onCheckedChange={() => onCheckedChange(option.value)}
              />
            </li>
          ))}
        </ul>

        <div className="tw-flex tw-px-2 tw-mt-2 tw-gap-2">
          <Button
            onClick={reset}
            htmlType="button"
            size={ButtonSize.Tiny}
            type={ButtonType.Main}
            variant={ButtonVariant.Secondary}
          >
            {weekdayMap.reset}
          </Button>
          <Button
            htmlType="button"
            onClick={selectAll}
            size={ButtonSize.Tiny}
            type={ButtonType.Main}
            variant={ButtonVariant.Secondary}
          >
            {weekdayMap.all}
          </Button>
        </div>
      </div>
    </div>
  );
};
