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
import { orUndefined } from "@litespace/utils";

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
    <div className="w-full relative" ref={inputRef}>
      <Input
        placeholder={placeholder}
        state={error ? "error" : "success"}
        helper={orUndefined(error)}
        value={value}
        disabled={disabled}
        onFocus={show}
        endAction={useMemo(
          () => ({
            id: 1,
            icon: <Clock className="w-4 h-4" />,
            onClick: toggle,
          }),
          [toggle]
        )}
      />

      <div
        data-open={open}
        ref={dateRef}
        className={cn(
          "bg-background-overlay border border-control rounded-md z-[1]",
          "flex flex-col gap-2 shadow-lg",
          "absolute whitespace-nowrap top-[calc(100%+1px)] right-0 overflow-hidden px-1 py-2",
          "opacity-0 data-[open=true]:opacity-100 transition-all duration-300 data-[open=true]:top-[calc(100%+5px)] invisible data-[open=true]:visible"
        )}
      >
        <Picker labels={labels} time={time} onChange={onChange} />
      </div>
    </div>
  );
};
