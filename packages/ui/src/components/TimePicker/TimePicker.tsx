import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Input } from "@/components/Input";
import Picker from "@/components/TimePicker/Picker";
import { Clock } from "react-feather";
import { FormatterMap, Time } from "@litespace/utils/time";
import cn from "classnames";

export type TimePickerProps = {
  placeholder?: string;
  error?: string | null;
  time?: Time;
  formatterMap?: FormatterMap;
  disabled?: boolean;
  labels: { am: string; pm: string };
  onChange?: (time: Time) => void;
};

export const TimePicker: React.FC<TimePickerProps> = ({
  time,
  error,
  labels,
  disabled,
  placeholder,
  formatterMap,
  onChange,
}) => {
  const inputRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(false);

  const show = useCallback(() => setOpen(true), []);
  const toggle = useCallback(() => setOpen(!open), [open]);

  const hide = useCallback((e: Event) => {
    if (
      inputRef.current &&
      e.target instanceof HTMLElement &&
      !inputRef.current.contains(e.target)
    )
      return setOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener("click", hide);
    return () => {
      document.removeEventListener("click", hide);
    };
  }, [hide]);

  const value = useMemo(() => {
    if (!time) return "";
    return time.format("midday", formatterMap);
  }, [formatterMap, time]);

  return (
    <div className="tw-w-full tw-relative" ref={inputRef}>
      <Input
        placeholder={placeholder}
        error={!!error}
        helper={error}
        value={value}
        disabled={disabled}
        onFocus={show}
        endActions={useMemo(
          () => [{ id: 1, Icon: Clock, onClick: toggle }],
          [toggle]
        )}
      />

      <div
        data-open={open}
        ref={dateRef}
        className={cn(
          "tw-bg-background-overlay tw-border tw-border-control tw-rounded-md tw-z-[1]",
          "tw-flex tw-flex-col tw-gap-2 tw-shadow-lg",
          "tw-absolute tw-whitespace-nowrap tw-top-[calc(100%+1px)] tw-right-0 tw-overflow-hidden tw-px-1 tw-py-2",
          "tw-opacity-0 data-[open=true]:tw-opacity-100 tw-transition-all tw-duration-300 data-[open=true]:tw-top-[calc(100%+5px)] tw-invisible data-[open=true]:tw-visible"
        )}
      >
        <Picker labels={labels} time={time} onChange={onChange} />
      </div>
    </div>
  );
};
