import React, { useMemo } from "react";
import { PatternFormat, PatternFormatProps } from "react-number-format";
import { Input, InputProps } from "@/components/Input";

export type PatternInputProps = Omit<PatternFormatProps, "customInput"> & {
  label?: InputProps["label"];
  state?: InputProps["state"];
  helper?: InputProps["helper"];
};

export const PatternInput = React.forwardRef<
  HTMLInputElement,
  PatternInputProps
>(({ label, state, helper, ...props }, ref) => {
  const CustomInput: React.FC<InputProps> = useMemo(
    () => (inputProps: InputProps) => {
      return (
        <Input
          ref={ref}
          label={label}
          state={state}
          helper={helper}
          {...inputProps}
        />
      );
    },
    [state, helper, ref, label]
  );

  return <PatternFormat customInput={CustomInput} {...props} />;
});
