import { ExtraInputProps, Input, InputProps } from "@/components/Input";
import React from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";

export type NumericInputProps = Omit<NumericFormatProps, "customInput"> &
  ExtraInputProps;

const CustomInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => <Input {...props} ref={ref} />
);

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  (props, ref) => {
    return (
      <NumericFormat customInput={CustomInput} {...props} getInputRef={ref} />
    );
  }
);

export default NumericInput;
