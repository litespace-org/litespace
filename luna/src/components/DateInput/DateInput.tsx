import React, { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/Input";
import { DatePicker } from "../DatePicker";
import { Dayjs } from "dayjs";

export const DateInput: React.FC<{
  placeholder?: string;
  error?: string | null;
  value?: Dayjs;
  disabled?: boolean;
  onChange?: (value: string) => void;
}> = ({ placeholder, error, value, disabled, onChange }) => {
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
        error={error}
        value={value?.format("YYYY-MM-DD")}
        disabled={disabled}
        onChange={onChange}
        onFocus={useCallback(() => {
          setShow(true);
        }, [])}
      />
      {show ? (
        <div
          className="absolute z-10 border border-control p-3 rounded-md top-[40px] right-0 bg-surface-100 shadow-2xl"
          ref={dateRef}
        >
          <DatePicker selected={value} onSelect={onSelect} compact />
        </div>
      ) : null}
    </div>
  );
};
