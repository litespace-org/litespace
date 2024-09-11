import React, { useCallback } from "react";
import { Root, Track, Range, Thumb } from "@radix-ui/react-slider";
import cn from "classnames";

export const Slider: React.FC<{
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}> = ({
  min = 0,
  max = 0,
  step = 0,
  value,
  disabled,
  onChange,
  onFocus,
  onBlur,
}) => {
  const onValueChange = useCallback(
    (values: number[]) => {
      const [value] = values;
      if (!value || !onChange) return;
      onChange(value);
    },
    [onChange]
  );

  return (
    <Root
      className="relative flex items-center select-none touch-none h-5"
      max={max}
      min={min}
      step={step}
      disabled={disabled}
      value={[value || 0]}
      onValueChange={onValueChange}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <Track className="bg-gray-200 relative grow rounded-full h-[4px] cursor-pointer">
        <Range className="absolute bg-brand-400 dark:bg-brand-500 hover:bg-brand/80 dark:hover:bg-brand/50 rounded-full h-full" />
      </Track>
      <Thumb
        className={cn(
          "block w-3 h-3 bg-brand-400 dark:bg-brand-500 shadow-lg rounded-full focus:outline-none",
          "border border-brand-500/75 dark:border-brand/30 hover:border-brand-600 dark:hover-border-brand cursor-pointer",
          "focus:outline-brand-600"
        )}
      />
    </Root>
  );
};
