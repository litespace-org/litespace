import React, { useMemo } from "react";
import { PatternFormat, PatternFormatProps } from "react-number-format";
import { Input, InputProps, ExtraInputProps } from "@/components/Input";

export type PatternInputProps = Omit<PatternFormatProps, "customInput"> &
  ExtraInputProps;

export const PatternInput = React.forwardRef<
  HTMLInputElement,
  PatternInputProps
>(
  (
    {
      idleDir,
      type,
      inputSize,
      icon,
      endAction,
      state,
      label,
      helper,
      ...props
    },
    ref
  ) => {
    const CustomInput: React.FC<InputProps> = useMemo(
      () => (inputProps: InputProps) => {
        return (
          <Input
            ref={ref}
            idleDir={idleDir}
            type={type}
            icon={icon}
            endAction={endAction}
            label={label}
            state={state}
            helper={helper}
            inputSize={inputSize}
            {...inputProps}
          />
        );
      },
      [ref, idleDir, type, icon, endAction, label, state, helper, inputSize]
    );

    return <PatternFormat customInput={CustomInput} {...props} />;
  }
);
