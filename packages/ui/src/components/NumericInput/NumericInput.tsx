import React, { useMemo } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Input, InputProps } from "@/components/Input";

export type NumericInputProps = Omit<NumericFormatProps, "customInput"> & {
  label?: InputProps["label"];
  state?: InputProps["state"];
  helper?: InputProps["helper"];
};

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ state, helper, label, ...props }, ref) => {
    const CustomInput: React.FC<InputProps> = useMemo(
      () => (inputProps: InputProps) => {
        return (
          <Input
            ref={ref}
            state={state}
            helper={helper}
            label={label}
            {...inputProps}
          />
        );
      },
      [state, helper, ref, label]
    );

    return <NumericFormat customInput={CustomInput} {...props} />;
  }
);

export default NumericInput;
