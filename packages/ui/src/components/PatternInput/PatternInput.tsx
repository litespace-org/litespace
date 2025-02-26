import React from "react";
import { PatternFormat, PatternFormatProps } from "react-number-format";
import { Input, InputProps, ExtraInputProps } from "@/components/Input";

export type PatternInputProps = Omit<PatternFormatProps, "customInput"> &
  ExtraInputProps;

const CustomInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => <Input {...props} ref={ref} />
);

export const PatternInput = React.forwardRef<
  HTMLInputElement,
  PatternInputProps
>((props, ref) => {
  return (
    <PatternFormat customInput={CustomInput} {...props} getInputRef={ref} />
  );
});
