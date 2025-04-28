import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Input } from "@/components/Input";
import { DatePicker } from "@/components/DatePicker";
import { Dayjs } from "dayjs";
import dayjs from "@/lib/dayjs";
import { Calendar } from "react-feather";
import { optional } from "@litespace/utils";

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
    <div className="w-full relative" ref={inputRef}>
      <Input
        placeholder={placeholder}
        state={error ? "error" : "success"}
        helper={optional(error)}
        value={value}
        disabled={disabled}
        onFocus={open}
        endAction={useMemo(
          () => ({
            id: 1,
            icon: <Calendar className="w-4 h-4" />,
            onClick: () => setShow(!show),
          }),
          [show]
        )}
      />
      {show ? (
        <div
          className="absolute z-10 border border-control p-3 rounded-md top-[40px] right-0 bg-surface-100 shadow-2xl w-max"
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
