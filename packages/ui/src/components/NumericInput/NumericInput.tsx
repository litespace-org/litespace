import React, { useMemo } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Input, InputProps } from "@/components/Input";
import { orUndefined } from "@litespace/utils";

export type NumericInputProps = Omit<NumericFormatProps, "customInput">;

const NumericInput = React.forwardRef<
  HTMLInputElement,
  NumericInputProps & { error?: boolean; helper?: string | null }
>(({ error, helper, ...props }, ref) => {
  const CustomInput: React.FC<InputProps> = useMemo(
    () => (inputProps: InputProps) => {
      return (
        <Input
          ref={ref}
          state={error ? "error" : "success"}
          helper={orUndefined(helper)}
          {...inputProps}
        />
      );
    },
    [error, helper, ref]
  );

  return <NumericFormat customInput={CustomInput} {...props} />;
});

export default NumericInput;
