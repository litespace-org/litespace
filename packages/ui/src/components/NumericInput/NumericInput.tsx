import { Input, InputProps } from "@/components/Input";
import React from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";

export type NumericInputProps = Omit<NumericFormatProps, "customInput"> & {
  label?: InputProps["label"];
  state?: InputProps["state"];
  helper?: InputProps["helper"];
};

const CustomInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ state, helper, label, ...props }, ref) => (
    <Input state={state} helper={helper} label={label} {...props} ref={ref} />
  )
);

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ state, helper, label, ...props }, ref) => {
    return (
      <NumericFormat
        customInput={CustomInput}
        state={state}
        helper={helper}
        label={label}
        {...props}
        getInputRef={ref}
      />
    );
  }
);

export default NumericInput;
