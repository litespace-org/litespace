import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Input } from "@/components/Input";
import { DatePicker } from "../DatePicker";
import { Dayjs } from "dayjs";
import dayjs from "@/lib/dayjs";
import { Calendar } from "react-feather";

export type DateInputProps = {
  placeholder?: string;
  error?: string | null;
  value?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  min?: Dayjs;
  max?: Dayjs;
  today?: string;
};

export const DateInput: React.FC<DateInputProps> = ({
  placeholder,
  error,
  value,
  disabled,
  min,
  max,
  today,
  onChange,
}) => {
  const inputRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState<boolean>(false);

  const hide = useCallback((e: Event) => {
    if (
      inputRef.current &&
      e.target instanceof HTMLElement &&
      !inputRef.current.contains(e.target)
    )
      return setShow(false);
  }, []);

  const onSelect = useCallback(
    (date: Dayjs) => {
      if (onChange) onChange(date.format("YYYY-MM-DD"));
      return setShow(false);
    },
    [onChange]
  );

  const open = useCallback(() => setShow(true), []);

  useEffect(() => {
    document.addEventListener("click", hide);
    return () => {
      document.removeEventListener("click", hide);
    };
  }, [hide]);

  return (
    <div className="tw-w-full tw-relative" ref={inputRef}>
      <Input
        placeholder={placeholder}
        error={error}
        value={value}
        disabled={disabled}
        onFocus={open}
        actions={useMemo(
          () => [{ id: 1, Icon: Calendar, onClick: () => setShow(!show) }],
          [show]
        )}
      />
      {show ? (
        <div
          className="tw-absolute tw-z-10 tw-border tw-border-control tw-p-3 tw-rounded-md tw-top-[40px] tw-right-0 tw-bg-surface-100 tw-shadow-2xl tw-w-max"
          ref={dateRef}
        >
          <DatePicker
            selected={
              dayjs(value, "YYYY-MM-DD").isValid() ? dayjs(value) : undefined
            }
            onSelect={onSelect}
            min={min}
            max={max}
            today={today}
            compact
          />
        </div>
      ) : null}
    </div>
  );
};
