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
import { FormatterMap, Time } from "@litespace/sol";

export const TimePicker: React.FC<{
  placeholder?: string;
  error?: string | null;
  time?: Time;
  formatterMap?: FormatterMap;
  disabled?: boolean;
  labels: { am: string; pm: string };
  onChange?: (time: Time) => void;
}> = ({
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
  const [show, setShow] = useState<boolean>(false);

  const hide = useCallback((e: Event) => {
    if (
      inputRef.current &&
      e.target instanceof HTMLElement &&
      !inputRef.current.contains(e.target)
    )
      return setShow(false);
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
        error={error}
        value={value}
        disabled={disabled}
        onFocus={useCallback(() => {
          setShow(true);
        }, [])}
        actions={useMemo(
          () => [{ id: 1, Icon: Clock, onClick: () => setShow(!show) }],
          [show]
        )}
      />

      {show ? (
        <div
          className="absolute z-10 border border-control rounded-md top-[40px] right-0 bg-surface-100 shadow-2xl"
          ref={dateRef}
        >
          <Picker labels={labels} time={time} onChange={onChange} />
        </div>
      ) : null}
    </div>
  );
};
