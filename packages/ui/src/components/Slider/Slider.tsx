import React, { useCallback, useEffect, useRef } from "react";
import cn from "classnames";

export const Slider: React.FC<{
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  disabled?: boolean;
  name?: string;
  id?: string;
  onValueChange?: (value: number) => void;
}> = ({
  min = 0,
  max = 0,
  step = 0,
  value,
  name,
  id,
  disabled,
  onValueChange,
}) => {
  const ref = useRef<HTMLInputElement>(null);

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value);
      if (Number.isNaN(value) || !onValueChange) return;
      onValueChange(value);
    },
    [onValueChange]
  );

  useEffect(() => {
    if (!ref.current) return;
    const currentValue = value || 0;
    const progress = (currentValue / max) * 100;
    ref.current.style.background = `linear-gradient(to right, #ffffff99 ${progress}%, #ffffff20 ${progress}%)`;
  }, [max, min, value]);

  return (
    <input
      dir="ltr"
      ref={ref}
      min={min}
      max={max}
      step={step}
      onChange={onChange}
      value={value}
      className={cn(
        "focus:tw-outline-none",
        "tw-w-full tw-appearance-none tw-h-1 tw-bg-white/30",
        "disabled:tw-opacity-50"
      )}
      disabled={disabled}
      type="range"
      name={name}
      id={id}
    />
  );
};
