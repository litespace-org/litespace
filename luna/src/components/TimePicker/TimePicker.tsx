import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Input } from "@/components/Input";
import Picker, { Meridiem } from "@/components/TimePicker/Picker";
import dayjs from "@/lib/dayjs";
import { Dir } from "@/components/Direction";
import { asMiddayHour, asRailwayHour } from "@/lib/time";
import { Clock } from "react-feather";

export const TimePicker: React.FC<{
  placeholder?: string;
  error?: string | null;
  value?: string;
  disabled?: boolean;
  labels: { am: string; pm: string };
  onChange?: (value: string) => void;
}> = ({ placeholder, error, value, disabled, labels, onChange }) => {
  const inputRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  const initial = useMemo(() => {
    if (!value) return;
    const [hours, mintues] = value.split(":");
    const [hour, meridiem] = asMiddayHour(Number(hours));
    return { hour, mintues: Number(mintues), meridiem };
  }, [value]);

  const [show, setShow] = useState<boolean>(false);
  const [mintue, setMintue] = useState<number>(initial?.mintues || 0);
  const [hour, setHour] = useState<number>(
    initial?.hour || Number(dayjs().format("h"))
  );
  const [meridiem, setMeridiem] = useState<Meridiem>(initial?.meridiem || "pm");

  const hide = useCallback((e: Event) => {
    if (
      inputRef.current &&
      e.target instanceof HTMLElement &&
      !inputRef.current.contains(e.target)
    )
      return setShow(false);
  }, []);

  useEffect(() => {
    if (!onChange) return;
    const railwayHour = asRailwayHour(hour, meridiem === "pm");
    const time = [
      railwayHour.toString().padStart(2, "0"),
      mintue.toString().padStart(2, "0"),
    ].join(":");
    onChange(time);
    // note: don't add `onChange` handler not to create infinite re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hour, meridiem, mintue]);

  useEffect(() => {
    document.addEventListener("click", hide);
    return () => {
      document.removeEventListener("click", hide);
    };
  }, [hide]);

  const inputValue = useMemo(() => {
    return [
      hour.toString().padStart(2, "0"),
      ":",
      mintue.toString().padStart(2, "0"),
      " ",
      meridiem === "am" ? labels.am : labels.pm,
    ].join("");
  }, [hour, labels.am, labels.pm, meridiem, mintue]);

  return (
    <div className="w-full relative" ref={inputRef}>
      <Input
        overrideDir={Dir.RTL}
        placeholder={placeholder}
        error={error}
        value={inputValue}
        disabled={disabled}
        onChange={onChange}
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
          <Picker
            labels={labels}
            meridiem={meridiem}
            hour={hour}
            mintue={mintue}
            onMeridiemChange={setMeridiem}
            onHourChange={setHour}
            onMintueChange={setMintue}
          />
        </div>
      ) : null}
    </div>
  );
};
