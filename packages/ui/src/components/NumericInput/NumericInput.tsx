import React, { useMemo } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Input, InputProps } from "@/components/Input";

export type NumericInputProps = Omit<NumericFormatProps, "customInput">;

const NumericInput = React.forwardRef<
  HTMLInputElement,
  NumericInputProps & { error?: boolean; helper?: string | null }
>(({ error, helper, ...props }, ref) => {
  const CustomInput: React.FC<InputProps> = useMemo(
    () => (inputProps: InputProps) => {
      return <Input ref={ref} error={error} helper={helper} {...inputProps} />;
    },
    [error, helper, ref]
  );

  return <NumericFormat customInput={CustomInput} {...props} />;
});

export default NumericInput;
