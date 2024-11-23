import React, { useMemo } from "react";
import { PatternFormat, PatternFormatProps } from "react-number-format";
import { Input, InputProps } from "@/components/Input";

export type PatternInputProps = Omit<PatternFormatProps, "customInput">;

export const PatternInput = React.forwardRef<
  HTMLInputElement,
  PatternInputProps & { error?: boolean; helper?: string | null }
>(({ error, helper, ...props }, ref) => {
  const CustomInput: React.FC<InputProps> = useMemo(
    () => (inputProps: InputProps) => {
      return <Input ref={ref} error={error} helper={helper} {...inputProps} />;
    },
    [error, helper, ref]
  );

  return <PatternFormat customInput={CustomInput} {...props} />;
});
