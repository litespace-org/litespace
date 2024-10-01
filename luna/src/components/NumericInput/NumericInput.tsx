import React from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Input } from "@/components/Input";

const NumericInput: React.FC<Omit<NumericFormatProps, "customInput">> = (
  props
) => {
  return <NumericFormat customInput={Input} {...props} />;
};

export default NumericInput;
